
// extrai a cifra em HTML e envia para o background
const scrapCode = () => {
    const element = document.querySelector(".cifra_cnt > pre")
    const code = new XMLSerializer().serializeToString(element);
    console.log(code)
}

scrapCode()