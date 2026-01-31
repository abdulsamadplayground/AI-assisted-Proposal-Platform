const axios = require('axios');

async function uploadSchemaToAI(schemaId) {
  try {
    // Fetch schema from backend
    console.log(`Fetching schema ${schemaId}...`);
    const schemaResponse = await axios.get(`http://localhost:3001/api/schemas/${schemaId}`);
    const schema = schemaResponse.data;
    
    console.log(`Schema: ${schema.name} v${schema.version}`);
    console.log(`Sections: ${schema.sections.length}`);
    
    // Upload to AI service
    console.log('Uploading to AI service...');
    const uploadResponse = await axios.post(
      'http://localhost:8000/api/ai/schemas',
      { schema_data: schema },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    console.log('✅ Schema uploaded successfully!');
    console.log('Response:', uploadResponse.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Get schema ID from command line or use the one from logs
const schemaId = process.argv[2] || 'a0371b93-3f36-4788-a9b8-8e96316b4e46';
uploadSchemaToAI(schemaId);
