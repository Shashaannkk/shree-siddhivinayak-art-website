const dataService = require('./dataService');

const runTests = async () => {
  console.log('🧪 Starting backend self-test...');
  
  try {
    // 1. Initialize data service (will seed database)
    await dataService.init();
    console.log('✅ DB Initialized & Seeded.');

    // 2. Fetch all murtis
    const murtis = await dataService.getMurtis();
    console.log(`📋 Total Murtis retrieved: ${murtis.length}`);
    console.log('Sample Murtis:');
    murtis.slice(0, 3).forEach(m => {
      console.log(` - [${m.code}] ${m.name} (${m.category}) - ${m.size} - ₹${m.price} [Status: ${m.status}]`);
    });

    // 3. Test Auto code generation
    console.log('\n🔢 Testing code generation:');
    const newGanpatiCode = await dataService.generateMurtiCode('Ganpati');
    console.log(`   Next Ganpati Code (should be GAN-004): ${newGanpatiCode}`);
    const newKrishnaCode = await dataService.generateMurtiCode('Krishna Theme');
    console.log(`   Next Krishna Code (should be KRI-002): ${newKrishnaCode}`);
    
    // 4. Test Analytics calculation
    console.log('\n📊 Testing Analytics calculation:');
    const analytics = await dataService.getAnalytics();
    console.log('   Stats:', analytics.stats);
    console.log('   Most Viewed:', analytics.mostViewed.map(m => `${m.code} (${m.views} views)`).join(', '));
    console.log('   Category Counts:', analytics.categoryStats);

    console.log('\n✅ Backend test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Backend test failed:', error);
    process.exit(1);
  }
};

runTests();
