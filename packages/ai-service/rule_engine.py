"""
Rule Engine - Enforces admin-defined rules on LLM-generated content.
Rules are NOT suggestions - they are ENFORCED constraints that LLM output must satisfy.
"""

import re
import logging
from typing import Dict, Any, List, Tuple, Optional
from schema_manager import SectionRule, RuleType, schema_manager

logger = logging.getLogger(__name__)


class RuleViolation:
    """Represents a rule violation"""
    def __init__(
        self,
        rule_id: str,
        rule_name: str,
        severity: str,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        self.rule_id = rule_id
        self.rule_name = rule_name
        self.severity = severity  # strict | warning | advisory
        self.message = message
        self.details = details or {}
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "rule_id": self.rule_id,
            "rule_name": self.rule_name,
            "severity": self.severity,
            "message": self.message,
            "details": self.details
        }


class RuleEnforcementResult:
    """Result of rule enforcement"""
    def __init__(self):
        self.violations: List[RuleViolation] = []
        self.passed: bool = True
        self.warnings: List[str] = []
        self.advisories: List[str] = []
    
    def add_violation(self, violation: RuleViolation):
        """Add a rule violation"""
        self.violations.append(violation)
        
        if violation.severity == "strict":
            self.passed = False
        elif violation.severity == "warning":
            self.warnings.append(violation.message)
        elif violation.severity == "advisory":
            self.advisories.append(violation.message)
    
    def has_strict_violations(self) -> bool:
        """Check if there are any strict violations"""
        return any(v.severity == "strict" for v in self.violations)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "passed": self.passed,
            "violations": [v.to_dict() for v in self.violations],
            "warnings": self.warnings,
            "advisories": self.advisories,
            "total_violations": len(self.violations),
            "strict_violations": len([v for v in self.violations if v.severity == "strict"])
        }


class RuleEngine:
    """
    Enforces admin-defined rules on LLM-generated content.
    Rules are applied AFTER LLM generation to validate and transform output.
    """
    
    def __init__(self):
        logger.info("Rule Engine initialized")
    
    def enforce_rules(
        self,
        content: str,
        rules: List[SectionRule],
        section_name: str,
        survey_notes: str
    ) -> RuleEnforcementResult:
        """
        Enforce all rules on generated content.
        
        Args:
            content: LLM-generated content
            rules: List of rules to enforce
            section_name: Name of the section
            survey_notes: Original survey notes (for validation)
        
        Returns:
            RuleEnforcementResult with violations and pass/fail status
        """
        result = RuleEnforcementResult()
        
        logger.info(f"Enforcing {len(rules)} rules on section: {section_name}")
        
        for rule in rules:
            try:
                violations = self._enforce_single_rule(content, rule, survey_notes)
                for violation in violations:
                    result.add_violation(violation)
            except Exception as e:
                logger.error(f"Error enforcing rule {rule.id}: {str(e)}")
                result.add_violation(RuleViolation(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    severity="warning",
                    message=f"Rule enforcement error: {str(e)}"
                ))
        
        logger.info(f"Rule enforcement complete", extra={
            "section": section_name,
            "passed": result.passed,
            "violations": len(result.violations),
            "strict_violations": len([v for v in result.violations if v.severity == "strict"])
        })
        
        return result
    
    def _enforce_single_rule(
        self,
        content: str,
        rule: SectionRule,
        survey_notes: str
    ) -> List[RuleViolation]:
        """Enforce a single rule and return violations"""
        violations = []
        
        if rule.type == RuleType.LENGTH:
            violations.extend(self._enforce_length_rule(content, rule))
        
        elif rule.type == RuleType.PATTERN:
            violations.extend(self._enforce_pattern_rule(content, rule))
        
        elif rule.type == RuleType.REQUIRED_FIELD:
            violations.extend(self._enforce_required_field_rule(content, rule))
        
        elif rule.type == RuleType.VALIDATION:
            violations.extend(self._enforce_validation_rule(content, rule, survey_notes))
        
        elif rule.type == RuleType.FORMAT:
            violations.extend(self._enforce_format_rule(content, rule))
        
        elif rule.type == RuleType.CONSTRAINT:
            violations.extend(self._enforce_constraint_rule(content, rule))
        
        return violations
    
    def _enforce_length_rule(self, content: str, rule: SectionRule) -> List[RuleViolation]:
        """Enforce length constraints"""
        violations = []
        content_length = len(content)
        
        min_length = rule.parameters.get("min")
        max_length = rule.parameters.get("max")
        
        if min_length and content_length < min_length:
            violations.append(RuleViolation(
                rule_id=rule.id,
                rule_name=rule.name,
                severity=rule.enforcement,
                message=rule.error_message or f"Content too short: {content_length} < {min_length}",
                details={"actual_length": content_length, "min_length": min_length}
            ))
        
        if max_length and content_length > max_length:
            violations.append(RuleViolation(
                rule_id=rule.id,
                rule_name=rule.name,
                severity=rule.enforcement,
                message=rule.error_message or f"Content too long: {content_length} > {max_length}",
                details={"actual_length": content_length, "max_length": max_length}
            ))
        
        return violations
    
    def _enforce_pattern_rule(self, content: str, rule: SectionRule) -> List[RuleViolation]:
        """Enforce regex pattern matching"""
        violations = []
        pattern = rule.parameters.get("pattern")
        
        if not pattern:
            return violations
        
        try:
            if not re.search(pattern, content, re.IGNORECASE):
                violations.append(RuleViolation(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    severity=rule.enforcement,
                    message=rule.error_message or f"Content does not match required pattern",
                    details={"pattern": pattern}
                ))
        except re.error as e:
            logger.error(f"Invalid regex pattern in rule {rule.id}: {str(e)}")
        
        return violations
    
    def _enforce_required_field_rule(self, content: str, rule: SectionRule) -> List[RuleViolation]:
        """Enforce required fields/keywords"""
        violations = []
        
        # Check for single field
        field = rule.parameters.get("field")
        if field:
            if field.lower() not in content.lower():
                violations.append(RuleViolation(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    severity=rule.enforcement,
                    message=rule.error_message or f"Required field '{field}' not found",
                    details={"missing_field": field}
                ))
        
        # Check for multiple fields
        fields = rule.parameters.get("fields", [])
        missing_fields = []
        for field in fields:
            if field.lower() not in content.lower():
                missing_fields.append(field)
        
        if missing_fields:
            violations.append(RuleViolation(
                rule_id=rule.id,
                rule_name=rule.name,
                severity=rule.enforcement,
                message=rule.error_message or f"Required fields missing: {', '.join(missing_fields)}",
                details={"missing_fields": missing_fields}
            ))
        
        return violations
    
    def _enforce_validation_rule(
        self,
        content: str,
        rule: SectionRule,
        survey_notes: str
    ) -> List[RuleViolation]:
        """Enforce validation rules"""
        violations = []
        
        # Check for mock/placeholder data
        check_for = rule.parameters.get("check_for", [])
        found_placeholders = []
        for placeholder in check_for:
            if placeholder.lower() in content.lower():
                found_placeholders.append(placeholder)
        
        if found_placeholders:
            violations.append(RuleViolation(
                rule_id=rule.id,
                rule_name=rule.name,
                severity=rule.enforcement,
                message=rule.error_message or f"Placeholder text found: {', '.join(found_placeholders)}",
                details={"placeholders_found": found_placeholders}
            ))
        
        # Check minimum items (for lists)
        min_items = rule.parameters.get("min_items")
        if min_items:
            # Count list items (simple heuristic: lines starting with -, *, or numbers)
            list_items = len(re.findall(r'^\s*[-*\d]+[\.)]\s+', content, re.MULTILINE))
            if list_items < min_items:
                violations.append(RuleViolation(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    severity=rule.enforcement,
                    message=rule.error_message or f"Insufficient items: {list_items} < {min_items}",
                    details={"actual_items": list_items, "min_items": min_items}
                ))
        
        return violations
    
    def _enforce_format_rule(self, content: str, rule: SectionRule) -> List[RuleViolation]:
        """Enforce format requirements"""
        violations = []
        required_format = rule.parameters.get("format")
        
        if required_format == "list":
            # Check if content is formatted as a list
            has_list_format = bool(re.search(r'^\s*[-*\d]+[\.)]\s+', content, re.MULTILINE))
            if not has_list_format:
                violations.append(RuleViolation(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    severity=rule.enforcement,
                    message=rule.error_message or "Content must be formatted as a list",
                    details={"required_format": "list"}
                ))
        
        elif required_format == "itemized":
            # Check for itemized format with costs
            has_itemized = bool(re.search(r'\$\d+|\d+\s*USD', content, re.IGNORECASE))
            if not has_itemized:
                violations.append(RuleViolation(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    severity=rule.enforcement,
                    message=rule.error_message or "Content must include itemized costs",
                    details={"required_format": "itemized"}
                ))
        
        elif required_format == "phases_with_duration":
            # Check for timeline phases with durations
            has_phases = bool(re.search(r'(phase|week|month|day)', content, re.IGNORECASE))
            if not has_phases:
                violations.append(RuleViolation(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    severity=rule.enforcement,
                    message=rule.error_message or "Content must include phases with durations",
                    details={"required_format": "phases_with_duration"}
                ))
        
        return violations
    
    def _enforce_constraint_rule(self, content: str, rule: SectionRule) -> List[RuleViolation]:
        """Enforce hard constraints"""
        violations = []
        
        # Add custom constraint logic here
        # This can be extended based on specific business rules
        
        return violations
    
    def apply_transformations(
        self,
        content: str,
        rules: List[SectionRule]
    ) -> str:
        """
        Apply transformation rules to modify content.
        
        Args:
            content: Original content
            rules: List of transformation rules
        
        Returns:
            Transformed content
        """
        transformed = content
        
        for rule in rules:
            if rule.type == RuleType.TRANSFORMATION:
                try:
                    transformed = self._apply_transformation(transformed, rule)
                except Exception as e:
                    logger.error(f"Error applying transformation {rule.id}: {str(e)}")
        
        return transformed
    
    def _apply_transformation(self, content: str, rule: SectionRule) -> str:
        """Apply a single transformation rule"""
        transformation_type = rule.parameters.get("type")
        
        if transformation_type == "add_prefix":
            prefix = rule.parameters.get("prefix", "")
            return f"{prefix}\n{content}"
        
        elif transformation_type == "add_suffix":
            suffix = rule.parameters.get("suffix", "")
            return f"{content}\n{suffix}"
        
        elif transformation_type == "replace":
            find = rule.parameters.get("find", "")
            replace = rule.parameters.get("replace", "")
            return content.replace(find, replace)
        
        return content


# Global rule engine instance
rule_engine = RuleEngine()
