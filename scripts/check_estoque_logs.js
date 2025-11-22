const sequelize = require('../src/config/database');
const EstoqueLog = require('../src/models/EstoqueLog');

(async ()=> {
  try{
    await sequelize.authenticate();
    const rows = await EstoqueLog.findAll({ order: [['data_hora','DESC']], limit: 50 });
    console.log(JSON.stringify(rows.map(r=>r.toJSON()), null, 2));
    process.exit(0);
  }catch(err){
    console.error(err);
    process.exit(1);
  }
})();
