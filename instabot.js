const puppeteer = require('puppeteer');

const escapeXpathString = str => {
    const splitedQuotes = str.replace(/'/g, `', "'", '`);
    return `concat('${splitedQuotes}', '')`;
  };

const clickButtonByText = async (page, text) => {
    const escapedText = escapeXpathString(text);
    const linkHandlers = await page.$x(`//button[contains(text(), ${escapedText})]`);
    
    if (linkHandlers.length > 0) {
      await linkHandlers[0].click();
    } else {
      throw new Error(`Link not found: ${text}`);
    }
  };

(async() => {
    console.log("Abriendo el navegador...");
    const browser = await puppeteer.launch({
      headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--remote-debugging-port=9222'
        ]
    });

    console.log("Generando nueva pestaña...");
    const page = await browser.newPage();

    console.log("Abriendo Instagram...");
    await page.goto('https://www.instagram.com/accounts/login/?source=auth_switcher', {waitUntil: 'networkidle2'});
    await page.waitForSelector('[name=username]');
    
    console.log('Terminada la carga de Instagram, escribiendo usuario...');
    await page.focus('[name=username]');
    await page.keyboard.type('rpatesting');

    console.log('Escribiendo contraseña...');
    await page.focus('[name=password]');
    await page.keyboard.type('armo2014');

    console.log('Presionando iniciar sesion...');
    var inputElement = await page.$('button[type=submit]');
    await inputElement.click();

    console.log("Esperando 5 segundos...");
    await new Promise((resolve, reject) => setTimeout(resolve, 5000));

    var [action] = process.argv.slice(2);
    var [profile] = process.argv.slice(3);

    console.log("Abriendo perfil objetivo...");
    await page.goto('https://www.instagram.com/'+profile, {waitUntil: 'networkidle2'});
    await page.waitForSelector('a[href="/about/us/"]');

    if(action == "follow"){
      console.log("Perfil cargado, presionando seguir...");
      try{
          await clickButtonByText(page, `Follow`);
      }
      catch{
          console.log("Ya estas siguiendo a "+profile+", deteniendose...");
          browser.close();
      }      
      console.log("Se siguió a "+profile);
    }    

    if(action == "unfollow"){
      console.log("Perfil cargado, dejando de seguir...");
      try{
          await clickButtonByText(page, `Following`);
      }
      catch{
          console.log("No estas siguiendo a este usuario, deteniendose...");
          browser.close();
      }
      
      console.log("Presionando dejar de seguir");
      await clickButtonByText(page, `Unfollow`);
      
      console.log("Se dejó de seguir a "+profile);
    }
   
    browser.close();

})();