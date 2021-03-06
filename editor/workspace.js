// ASCIIMath Editor | © 2017 Francesco Menzani – asciimatheditor@menzani.eu | https://www.gnu.org/licenses/agpl-3.0.txt
"use strict"

const BACKGROUNDS = [
    "linear-gradient(to top, rgba(30, 144, 255, 0), rgba(30, 144, 255, 1))",
    "linear-gradient(to top, rgba(255, 140, 0, 0), rgba(255, 127, 80, 1))",
    "linear-gradient(to top, rgba(0, 250, 154, 0), rgba(46, 139, 87, 1))"
]
const WALLPAPERS = [
    "abstract1.jpg", "abstract2.jpg", "abstract3.jpg",
    "lake1.jpg", "lake2.jpg",
    "river1.jpg", "river2.jpg", "river3.jpg",
    "forest1.jpg", "forest2.jpg",
    "skyline1.jpg", "skyline2.jpg"
]

const ERROR_DOCUMENT_SAVE_STORAGE = "document_save_storage"
const ERROR_DOCUMENT_SAVE = "document_save"

let currentBackgroundLayer = false
let currentWallpaperIndex

let backgroundLayer1
let backgroundLayer2
let topBar
let savingStatus
let browserMessage
let syntax
let syntaxTabsASCIIMath
let syntaxTabsFormatting
let syntaxASCIIMath
let syntaxFormatting
let infoMessage
let infoMessageText
let browserInform
let about
let flaticon
let donate
let contact
let pageViewSaveInstructions
let debug
let debugConsole
let debugDocumentEvents
let debugKeyPress
let errorMessage
let errorMessageSpan

document.addEventListener("DOMContentLoaded", function () {
    backgroundLayer1 = document.getElementById("backgroundLayer1")
    backgroundLayer2 = document.getElementById("backgroundLayer2")
    topBar = document.getElementById("topBar")
    savingStatus = document.getElementById("topBar-savingStatus")
    browserMessage = document.getElementById("browserMessage")
    syntax = document.getElementById("syntax")
    syntaxTabsASCIIMath = document.getElementById("syntaxTabsASCIIMath")
    syntaxTabsFormatting = document.getElementById("syntaxTabsFormatting")
    syntaxASCIIMath = undefined // In composeHTML()
    syntaxFormatting = undefined // In composeHTML()
    infoMessage = document.getElementById("infoMessage")
    infoMessageText = document.getElementById("infoMessageText")
    browserInform = document.getElementById("browserInform")
    about = document.getElementById("about")
    flaticon = document.getElementById("flaticon")
    donate = document.getElementById("donate")
    contact = document.getElementById("contact")
    pageViewSaveInstructions = document.getElementById("pageViewSaveInstructions")
    debug = document.getElementById("debug")
    debugConsole = document.getElementById("debugConsole")
    debugDocumentEvents = document.getElementById("debugDocumentEvents")
    debugKeyPress = document.getElementById("debugKeyPress")
    errorMessage = document.getElementById("errorMessage")
    errorMessageSpan = document.getElementById("errorMessageSpan")

    document.body.style.background = selectRandomly(BACKGROUNDS)
    document.body.style.backgroundAttachment = "fixed"
})

function initialize() {
    currentWallpaperIndex = nextRandomNumber(0, WALLPAPERS.length)
    loadWallpaper()
    WALLPAPERS.loadTaskId = setInterval(loadWallpaper, 10 * 60 * 1000)

    if (!navigator.userAgent.includes("Firefox")) {
        showBrowserMessage()
    }

    composeHTML().then(function () {
        asciimath.processNode(syntaxASCIIMath)
        selectSyntaxTab(syntaxTabsASCIIMath)
    })

    openDocument()
}

function loadWallpaper() {
    setWallpaper("resources/wallpapers/" + WALLPAPERS[currentWallpaperIndex])
    if (++currentWallpaperIndex === WALLPAPERS.length) {
        currentWallpaperIndex = 0
    }
}

function loadCustomWallpaper() {
    let url = prompt("Please set the wallpaper image URL:", "resources/wallpapers/")
    if (url) {
        if (WALLPAPERS.loadTaskId) {
            clearInterval(WALLPAPERS.loadTaskId)
            delete WALLPAPERS.loadTaskId
        }
        setWallpaper(url)
    }
}

function setWallpaper(url) {
    if (currentBackgroundLayer) {
        backgroundLayer2.classList.remove("backgroundLayerAnimation")
        backgroundLayer2.src = url
    } else {
        backgroundLayer1.classList.remove("backgroundLayerAnimation")
        backgroundLayer1.src = url
    }
    currentBackgroundLayer = !currentBackgroundLayer
}

function hidePopup(popup) {
    popup.classList.remove("popupAppearAnimation")
    popup.classList.add("popupDisappearAnimation")
    popup.popupOpen = false
}

function showPopup(popup) {
    popup.classList.remove("popupDisappearAnimation")
    popup.classList.add("popupAppearAnimation")
    popup.popupOpen = true
}

function showBrowserMessage() {
    topBar.style.display = "none"
    showPopup(browserMessage)
}

function toggleSyntax() {
    if (syntax.popupOpen) {
        hidePopup(syntax)
    } else {
        showPopup(syntax)
    }
}

function showInfoMessage(html) {
    infoMessageText.innerHTML = html
    if (infoMessage.closeTaskId) {
        clearTimeout(infoMessage.closeTaskId)
    }
    showPopup(infoMessage)
    infoMessage.closeTaskId = setTimeout(function () {
        hidePopup(infoMessage)
        infoMessage.closeTaskId = null
    }, 2000)
}

function showCustomInfoMessage() {
    let html = prompt("Please set the info message HTML fragment:")
    if (html) {
        showInfoMessage(html)
    }
}

function hideBrowserInform(event) {
    hidePopup(browserInform)
    event.preventDefault()
}

function showBrowserInform(event) {
    showPopup(browserInform)
    event.preventDefault()
}

function hideAbout(event) {
    for (let aboutLink of about.querySelectorAll(".aboutLink")) {
        aboutLink.classList.remove("aboutLinkAnimation")
    }
    hidePopup(about)
    event.preventDefault()
}

function showAbout() {
    for (let aboutLink of about.querySelectorAll(".aboutLink")) {
        aboutLink.classList.add("aboutLinkAnimation")
    }
    showPopup(about)
}

function hideFlaticon(event) {
    hidePopup(flaticon)
    event.preventDefault()
}

function showFlaticon(event) {
    showPopup(flaticon)
    event.preventDefault()
}

function hideDonate(event) {
    hidePopup(donate)
    event.preventDefault()
}

function showDonate(event) {
    showPopup(donate)
    event.preventDefault()
}

function hideContact(event, mailSubject) {
    hidePopup(contact)
    if (mailSubject) {
        window.open("mailto:contact@asciimatheditor.eu?subject=" + mailSubject)
    }
    event.preventDefault()
}

function showContact(event) {
    showPopup(contact)
    event.preventDefault()
}

function hidePageViewSaveInstructions(event) {
    pageViewSaveInstructions.targetViewOutput.style.backgroundClip = "border-box"
    hidePopup(pageViewSaveInstructions)
    event.preventDefault()
}

function showPageViewSaveInstructions() {
    if (currentPageIndex === -1) {
        return
    }

    let page = pages[currentPageIndex]
    pageViewSaveInstructions.style.top = page.view.offsetTop + "px"
    let offsetLeft = page.viewOutput.offsetLeft
    if (offsetLeft === 0) {
        pageViewSaveInstructions.style.left = ""
        pageViewSaveInstructions.style.right = "200px"
    } else {
        pageViewSaveInstructions.style.left = (offsetLeft + page.viewOutput.offsetWidth) + "px"
        pageViewSaveInstructions.style.right = ""
    }
    showPopup(pageViewSaveInstructions)
    page.viewOutput.style.backgroundClip = "content-box, padding-box"
    pageViewSaveInstructions.targetViewOutput = page.viewOutput
}

function toggleDebug() {
    if (debug.popupOpen) {
        clearInterval(debugConsole.refreshTaskId)
        hidePopup(debug)
    } else {
        refreshDebugConsole()
        showPopup(debug)
        debugConsole.refreshTaskId = setInterval(refreshDebugConsole, 100)
    }
}

function refreshDebugConsole() {
    let result = ""
    for (let {key, value, separator} of [
        {key: "currentBackgroundLayer", value: currentBackgroundLayer},
        {key: "currentWallpaperIndex", value: currentWallpaperIndex},
        {separator: true},
        {key: "windowScrollY", value: windowScrollY},
        {key: "pageCount", value: pageCount},
        {separator: true},
        {key: "currentPageIndex", value: currentPageIndex},
        {key: "editorsValueData", value: editorsValueData},
        {key: "editorsHeightData", value: editorsHeightData},
        {key: "editorsSelectionStartData", value: editorsSelectionStartData},
        {key: "editorsSelectionEndData", value: editorsSelectionEndData},
        {key: "editorsScrollTopData", value: editorsScrollTopData},
        {key: "viewsScrollTopData", value: viewsScrollTopData},
        {key: "viewsScrollLeftData", value: viewsScrollLeftData}]) {
        if (separator) {
            result += "\r\n"
        } else {
            result += (key + " = " + debugConsole_format(value) + "\r\n")
        }
    }
    debugConsole.textContent = result
}

function debugConsole_format(value) {
    if (value === null) {
        return "null"
    }
    if (value === undefined) {
        return "undefined"
    }
    if (typeof value === "string") {
        return "\"" + value + "\""
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return "[]"
        }
        let result = "["
        for (let e of value) {
            result += (debugConsole_format(e) + ", ")
        }
        return result.slice(0, result.length - 2) + "]"
    }
    return value.toString()
}

function hideErrorMessage(event) {
    hidePopup(errorMessage)
    event.preventDefault()
}

function showErrorMessage(id) {
    let html
    switch (id) {
        case ERROR_DOCUMENT_SAVE_STORAGE:
            html = "The document is too long. Please delete some content or <a class=\"messageLink\" href=\"\">adjust Firefox's settings</a>."
            break
        case ERROR_DOCUMENT_SAVE:
            html = "The document cannot be saved."
            break
        default:
            console.error("Unknown error message ID: " + id)
            return
    }
    errorMessageSpan.innerHTML = html
    showPopup(errorMessage)
}

function showCustomErrorMessage() {
    let id = prompt("Please set the error message ID:")
    if (id) {
        showErrorMessage(id)
    }
}

function showWallpaper() {
    setTimeout(function () {
        if (currentBackgroundLayer) {
            backgroundLayer1.classList.add("backgroundLayerAnimation")
            backgroundLayer1.style.zIndex = "-1"
            backgroundLayer2.style.zIndex = "-2"
        } else {
            backgroundLayer2.classList.add("backgroundLayerAnimation")
            backgroundLayer2.style.zIndex = "-1"
            backgroundLayer1.style.zIndex = "-2"
        }
    }, 3000)
}

function visitHomepage() {
    window.open("https://asciimatheditor.eu/")
}

function visitFirefoxDownloadPage(event) {
    window.open("https://www.mozilla.org/it/firefox/new/")
    if (event) {
        event.preventDefault()
    }
}

function visitASCIIMathHomepage(event) {
    window.open("http://asciimath.org/")
    event.preventDefault()
}

function composeHTML() {
    return getResource("syntax.html").then(function (data) {
        data = data.substring(data.search(LINE_SEPARATOR) + 1) // Remove file copyright notice
        syntax.insertAdjacentHTML("beforeend", data)

        syntaxASCIIMath = document.getElementById("syntaxASCIIMath")
        syntaxFormatting = document.getElementById("syntaxFormatting")
    })
}

function selectSyntaxTab(tab) {
    switch (tab) {
        case syntaxTabsASCIIMath:
            syntaxTabsASCIIMath.classList.add("syntaxTabsButtonSelected")
            syntaxTabsFormatting.classList.remove("syntaxTabsButtonSelected")
            syntaxASCIIMath.style.display = "block"
            syntaxFormatting.style.display = "none"
            break
        case syntaxTabsFormatting:
            syntaxTabsASCIIMath.classList.remove("syntaxTabsButtonSelected")
            syntaxTabsFormatting.classList.add("syntaxTabsButtonSelected")
            syntaxASCIIMath.style.display = "none"
            syntaxFormatting.style.display = "block"
            break
        default:
            console.error("Unknown syntax tab: " + tab)
    }
}

function copyContent(node) {
    let dummyTextarea = document.createElement("textarea")
    let content = node.textContent.trim()
    dummyTextarea.textContent = content
    document.body.appendChild(dummyTextarea)
    dummyTextarea.select()
    try {
        document.execCommand("copy")
        showInfoMessage("<b>Copied:</b> " + content)
    } catch (e) {
        console.error(e)
    } finally {
        document.body.removeChild(dummyTextarea)
    }
}

function resolveShortcut(event) {
    if (debugKeyPress.checked) {
        console.group("body.onkeypress")
        console.info("charCode = " + event.charCode)
        console.info("keyCode = " + event.keyCode)
        console.groupEnd()
    }

    if (event.ctrlKey && event.altKey) {
        switch (event.charCode) {
            case 100:
                doRemovePage()
                break
            case 105:
                toggleDebug()
                break
            case 110:
                doAddPage()
                break
            case 112:
                showPageViewSaveInstructions()
                break
            case 113:
                toggleSyntax()
                break
            case 115:
                downloadPageSource()
                break
        }
        switch (event.keyCode) {
            case 38:
                doJumpUp()
                break
            case 40:
                doJumpDown()
                break
        }
    }
}