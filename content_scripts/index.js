/**
  *  This function handles the button click event and extracts the guitar tab information from cifra club
  *  @returns ciper
  *  @type cipher = {
  *     id: uniqueString
  *     title: string
  *     code: string
  *     playlists: id[]
  *     settings: { fontSize: float, tablatura: boolean, scrollSpeed: int }
  *  }
  */

const handleButton = () => {
  try {
    const title = prompt("Escreva um titulo:", `${document.querySelector(".t1").innerText} (${document.querySelector(".t3").innerText})`);

    const cipher = {
      code: new XMLSerializer().serializeToString(document.querySelector(".cifra_cnt > pre")),
      id: `${new Date().getTime()}wow${Math.floor(Math.random() * 1000000)}`,
      settings: { fontSize: 1.5, tablatura: false, scrollSpeed: 10 },
      playlists: [],
      title: title,
    }

    // console.log('Successfully created cipher object:', cipher)
    browser.runtime.sendMessage({ type: "target", cipher }).then(handleResponse, handleError);
  } catch (error) {
    // console.error("Error occurred while sending target cipher to background script", error);
  }
}

/**
 * This function create the button component and add to the sidebar list
 * @param imageUrl: logo url request by browser runtime getURL
 */


const renderButton = (imageUrl) => {
  // console.log("Creating button with URL:", imageUrl)
  const menu = document.querySelector("#side-menu ul li");
  if (!menu) {
    // console.warn("Unable to create Data Cifras logo: menu not found");
    return;
  }

  // remove possible buttons already present in the menu
  const prevButtons = document.querySelectorAll("#data-cifras-button");
  prevButtons.forEach((el) => el.parentNode.removeChild(el));

  // create the button component
  const button = document.createElement("button");
  const img = document.createElement("img");
  img.setAttribute("src", imageUrl);
  img.setAttribute("alt", "Data Cifras logo");
  button.appendChild(img);

  const label = document.createTextNode("Data Cifras");
  button.appendChild(label);
  button.id = "data-cifras-button";

  button.addEventListener("click", handleButton);

  // Append button to menu element
  menu.appendChild(button);
  // console.log("Data Cifras button created");
};

/* -------------------------------------------------------------------------- */
/*                                    main                                    */
/* -------------------------------------------------------------------------- */

const handleError = (error) => console.log(`Error on comunicate with background: ${error}`);
const handleResponse = (message) => {
  // console.log("Recive message from background", message)
  if (message.type === 'logoURL') renderButton(message.logoURL)
  // else console.log("Background message", message)
}

const main = (e) => browser.runtime.sendMessage({ type: "logoURL"}).then(handleResponse, handleError);

// Run the main function on load and on change location url
window.addEventListener('locationchange', main);
main()