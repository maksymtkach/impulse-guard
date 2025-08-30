import { loadSettings } from "./config.js";
import { bootstrap } from "./control.js";

(async function init(){
  await loadSettings(); 
  bootstrap();          
})();
