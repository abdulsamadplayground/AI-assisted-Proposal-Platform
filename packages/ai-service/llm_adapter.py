"""
LLM Adapter - Handles real LLM API calls with retry logic and token tracking.
NO mock responses - all calls use actual LLM providers (OpenAI/Groq).
"""

import os
import asyncio
import logging
from typing import Dict, Any, Optional, List
from enum import Enum
import time

# LLM Provider SDKs
from openai import AsyncOpenAI, OpenAIError
from groq import AsyncGroq, GroqError

logger = logging.getLogger(__name__)


class LLMProvider(str, Enum):
    """Supported LLM providers"""
    OPENAI = "openai"
    GROQ = "groq"
    AZURE = "azure"


class LLMAdapter:
    """
    Adapter for LLM API calls with retry logic, rate limiting, and token tracking.
    Processes REAL user survey notes - NO mock data.
    """
    
    def __init__(self):
        self.provider = LLMProvider(os.getenv("LLM_PROVIDER", "groq"))
        self.max_retries = int(os.getenv("LLM_MAX_RETRIES", "3"))
        self.timeout = int(os.getenv("LLM_TIMEOUT", "30"))
        self.max_tokens = int(os.getenv("LLM_MAX_TOKENS", "500"))
        self.temperature = float(os.getenv("LLM_TEMPERATURE", "0.7"))
        
        # Initialize clients based on provider
        self.client = None
        self.model = None
        self._initialize_client()
        
        # Token usage tracking
        self.total_tokens_used = 0
        self.total_cost = 0.0
        
        logger.info(f"LLM Adapter initialized", extra={
            "provider": self.provider,
            "model": self.model,
            "max_retries": self.max_retries,
            "real_api_calls": True,
            "mock_mode": False
        })
    
    def _initialize_client(self):
        """Initialize the appropriate LLM client based on provider"""
        if self.provider == LLMProvider.GROQ:
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("GROQ_API_KEY not found in environment variables")
            
            self.client = AsyncGroq(api_key=api_key)
            self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
            logger.info("Initialized Groq client with REAL API key")
            
        elif self.provider == LLMProvider.OPENAI:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY not found in environment variables")
            
            api_base = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
            self.client = AsyncOpenAI(api_key=api_key, base_url=api_base)
            self.model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
            logger.info("Initialized OpenAI client with REAL API key")
            
        elif self.provider == LLMProvider.AZURE:
            api_key = os.getenv("AZURE_OPENAI_API_KEY")
            endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
            if not api_key or not endpoint:
                raise ValueError("Azure OpenAI credentials not found in environment variables")
            
            self.client = AsyncOpenAI(
                api_key=api_key,
                base_url=f"{endpoint}/openai/deployments/{os.getenv('AZURE_OPENAI_DEPLOYMENT')}",
                api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2023-05-15")
            )
            self.model = os.getenv("AZURE_OPENAI_DEPLOYMENT")
            logger.info("Initialized Azure OpenAI client with REAL API key")
        
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    async def generate_completion(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Generate completion from REAL LLM API with retry logic.
        
        Args:
            prompt: User prompt (REAL survey notes, not mock data)
            system_message: System instructions
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
        
        Returns:
            Dict containing:
                - content: Generated text
                - tokens_used: Token count
                - estimated_cost: Cost estimate
                - model: Model used
                - provider: Provider used
        
        Raises:
            Exception: If all retries fail
        """
        max_tokens = max_tokens or self.max_tokens
        temperature = temperature or self.temperature
        
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})
        
        # Retry logic with exponential backoff
        for attempt in range(self.max_retries):
            try:
                start_time = time.time()
                
                logger.info(f"Making REAL LLM API call (attempt {attempt + 1}/{self.max_retries})", extra={
                    "provider": self.provider,
                    "model": self.model,
                    "prompt_length": len(prompt),
                    "mock_mode": False
                })
                
                # Make REAL API call (NO mocks)
                response = await asyncio.wait_for(
                    self.client.chat.completions.create(
                        model=self.model,
                        messages=messages,
                        max_tokens=max_tokens,
                        temperature=temperature
                    ),
                    timeout=self.timeout
                )
                
                elapsed_time = time.time() - start_time
                
                # Extract response data
                content = response.choices[0].message.content
                tokens_used = response.usage.total_tokens if hasattr(response, 'usage') else 0
                
                # Calculate estimated cost (rough estimates)
                estimated_cost = self._calculate_cost(tokens_used)
                
                # Track usage
                self.total_tokens_used += tokens_used
                self.total_cost += estimated_cost
                
                logger.info("REAL LLM API call successful", extra={
                    "provider": self.provider,
                    "model": self.model,
                    "tokens_used": tokens_used,
                    "estimated_cost": estimated_cost,
                    "elapsed_time": elapsed_time,
                    "attempt": attempt + 1,
                    "mock_mode": False
                })
                
                return {
                    "content": content,
                    "tokens_used": tokens_used,
                    "estimated_cost": estimated_cost,
                    "model": self.model,
                    "provider": self.provider.value,
                    "elapsed_time": elapsed_time
                }
                
            except asyncio.TimeoutError:
                logger.warning(f"LLM API call timed out (attempt {attempt + 1}/{self.max_retries})")
                if attempt == self.max_retries - 1:
                    raise Exception(f"LLM API call timed out after {self.max_retries} attempts")
                await self._exponential_backoff(attempt)
                
            except (OpenAIError, GroqError) as e:
                logger.error(f"LLM API error (attempt {attempt + 1}/{self.max_retries})", extra={
                    "error": str(e),
                    "provider": self.provider
                })
                if attempt == self.max_retries - 1:
                    raise Exception(f"LLM API call failed after {self.max_retries} attempts: {str(e)}")
                await self._exponential_backoff(attempt)
                
            except Exception as e:
                logger.error(f"Unexpected error in LLM API call", extra={
                    "error": str(e),
                    "provider": self.provider
                })
                if attempt == self.max_retries - 1:
                    raise
                await self._exponential_backoff(attempt)
    
    async def _exponential_backoff(self, attempt: int):
        """Exponential backoff between retries"""
        wait_time = min(2 ** attempt, 10)  # Max 10 seconds
        logger.info(f"Waiting {wait_time}s before retry")
        await asyncio.sleep(wait_time)
    
    def _calculate_cost(self, tokens: int) -> float:
        """
        Calculate estimated cost based on tokens and provider.
        Rough estimates - actual costs may vary.
        """
        if self.provider == LLMProvider.GROQ:
            # Groq is free for now, but track as if it costs
            return tokens * 0.0001 / 1000  # $0.0001 per 1K tokens (hypothetical)
        
        elif self.provider == LLMProvider.OPENAI:
            if "gpt-4" in self.model:
                return tokens * 0.03 / 1000  # $0.03 per 1K tokens
            else:  # gpt-3.5-turbo
                return tokens * 0.002 / 1000  # $0.002 per 1K tokens
        
        elif self.provider == LLMProvider.AZURE:
            # Azure pricing varies by deployment
            return tokens * 0.002 / 1000
        
        return 0.0
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """Get cumulative usage statistics"""
        return {
            "total_tokens_used": self.total_tokens_used,
            "total_cost": round(self.total_cost, 4),
            "provider": self.provider.value,
            "model": self.model
        }
    
    async def generate_with_fallback(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        fallback_providers: Optional[List[LLMProvider]] = None
    ) -> Dict[str, Any]:
        """
        Generate completion with fallback to alternative providers if primary fails.
        
        Args:
            prompt: User prompt (REAL survey notes)
            system_message: System instructions
            fallback_providers: List of fallback providers to try
        
        Returns:
            Dict containing generation result
        """
        try:
            return await self.generate_completion(prompt, system_message)
        except Exception as e:
            logger.warning(f"Primary provider {self.provider} failed: {str(e)}")
            
            if not fallback_providers:
                raise
            
            # Try fallback providers
            original_provider = self.provider
            original_client = self.client
            original_model = self.model
            
            for fallback in fallback_providers:
                try:
                    logger.info(f"Trying fallback provider: {fallback}")
                    self.provider = fallback
                    self._initialize_client()
                    
                    result = await self.generate_completion(prompt, system_message)
                    logger.info(f"Fallback provider {fallback} succeeded")
                    return result
                    
                except Exception as fallback_error:
                    logger.warning(f"Fallback provider {fallback} failed: {str(fallback_error)}")
                    continue
            
            # Restore original provider
            self.provider = original_provider
            self.client = original_client
            self.model = original_model
            
            raise Exception("All LLM providers failed")


# Global LLM adapter instance
llm_adapter = LLMAdapter()
