const sequelize = require('../src/config/database');
const EstoqueLog = require('../src/models/EstoqueLog');

(async ()=>{
  try{
    console.log('Sincronizando model EstoqueLog...');
    await EstoqueLog.sync({ alter: true });
    console.log('Tabela estoque_logs sincronizada.');
    await sequelize.close();
    process.exit(0);
  }catch(err){
    console.error('Erro ao sincronizar:', err);
    process.exit(1);
  }
})();
