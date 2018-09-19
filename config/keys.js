// just have the development environment for now
if(process.env.NODE_ENV === 'production'){
module.exports =  require('./prod');
}else{
  module.exports =  require('./dev');
}
