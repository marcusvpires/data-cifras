
// extrai a cifra em HTML e envia para o background
const scrapCode = () => {
    const title = document.querySelector(".t1").innerText
    const author = document.querySelector(".t3").innerText
    const cifra = document.querySelector(".cifra_cnt > pre")
    const code = new XMLSerializer().serializeToString(cifra);
    console.log("data cifra carregado:", title)
    if (code) browser.runtime.sendMessage({"targetcifra": {
        title, author, code
    }});
    else alert("erro ao coletar a cifra")
}

scrapCode()