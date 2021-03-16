import Toast from './toast.js';

const saveData = 'connection' in navigator && navigator.connection.saveData;
const observable =
  typeof IntersectionObserver !== 'undefined' &&
  'forEach' in NodeList.prototype;

  /*****************************************************************
 * night mode
 * ****************************************************************/

  
 

const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark'); //add this
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light'); //add this
    }    
}
toggleSwitch.addEventListener('change', switchTheme, false);



const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}
 
 /*****************************************************************
 * TOC
 * ****************************************************************/
// https://gomakethings.com/finding-the-next-and-previous-sibling-elements-that-match-a-selector-with-vanilla-js/
 var getPreviousSibling = function (elem, selector) {

	// Get the previous sibling element
	var sibling = elem.previousElementSibling;

	// If the sibling matches our selector, use it
	// If not, jump to the previous sibling and continue the loop
	while (sibling) {
		if (sibling.matches(selector)) return sibling.id;
		sibling = sibling.previousElementSibling;
    if (sibling == undefined) return null;
	}

};
 var findSection = function (centeredElement) {
     if(centeredElement.classList.contains('legibilityWidth')||centeredElement.classList.contains('wrap0')){
       return null;
    }else{
      var element=centeredElement;
      while (element){
        if (element.matches('.legibilityWidth > *')||element.matches('.wrap0 > *')) return getPreviousSibling(element,"h2,h3,h4,h5,h6");
        if (element.matches('body')) return null;
        element = element.parentNode;
      }
    }
}
/* Open */

var scrollPosition = 0;

var myNav=document.getElementById("myNav");
var navToc=document.getElementById("navToc");
var tocSelectedEle = null;

 function openNav   () { 
if(myNav.style.height === "100%"){
window.scrollTo(0, scrollPosition);
myNav.style.height = 0;
navToc.classList.remove("onclickbuttonon");
if(tocSelectedEle) tocSelectedEle.classList.remove("selected-B");
}else{
    scrollPosition = window.pageYOffset;
    if (Math.sign(scrollPosition-55)==-1){
window.scrollBy(0, 60);
scrollPosition =60;
}
myNav.style.height = "100%";
navToc.classList.add("onclickbuttonon");

const centeredElement = document.elementFromPoint(
  document.documentElement.clientWidth/2,  document.documentElement.clientHeight*0.5 
);
var sectionId=findSection(centeredElement)  ;

if(sectionId && sectionId!=""){}else{
   const centeredElement2 = document.elementFromPoint(
  document.documentElement.clientWidth/2,  document.documentElement.clientHeight*0.75 
);
   sectionId=findSection(centeredElement2)  ;
}
   
if(sectionId && sectionId!=""){}else{
   const centeredElement2 = document.elementFromPoint(
  document.documentElement.clientWidth/2,  document.documentElement.clientHeight*0.25 
);
   sectionId=findSection(centeredElement2)  ;
}
   if(sectionId && sectionId!=""){
     tocSelectedEle = document.querySelectorAll('#myNav a[href^="#'+sectionId+'"]')[0];
    if(tocSelectedEle){
     tocSelectedEle.classList.add("selected-B");
     var temp= new Promise(resolve => setTimeout(resolve, 500));
     tocSelectedEle.scrollIntoView();
     myNav.scrollTop -= 100;
   //   let position = bluetocSelectedEle.getBoundingClientRect();
  // scrolls to 20px above element
  //window.scrollTo(position.left, position.top + window.scrollY - 20);
  }}
}
}   
if(myNav &&navToc){
  navToc.addEventListener("click", openNav, false);
  myNav.addEventListener("click", openNav, false);

}

 


  
/*****************************************************************
 * Statistics
 * ****************************************************************/

(function (window) {
  let bodyElement = window.document.querySelector('body');
  bodyElement.setAttribute('data-viewportwidth', window.viewport_width);
  bodyElement.setAttribute('data-screendensity', window.screen_density);
  bodyElement.setAttribute('data-rootfontsize', window.root_font_size);
  
  
})(window);

/*****************************************************************
 * Install Service Worker
 * ****************************************************************/

if (process.env.NODE_ENV === 'production') {
  // Install Service Worker only on production
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js');
    });

    // navigator.serviceWorker.addEventListener('message', async (event) => {
    //   // Optional: ensure the message came from workbox-broadcast-update
    //   if (event.data.meta === 'workbox-broadcast-update') {
    //     const { cacheName, updatedURL } = event.data.payload;
    //     console.groupCollapsed(
    //       `[Page] Updated content in "${cacheName}": ${updatedURL}`
    //     );
    //     const cache = await caches.open(cacheName);
    //     const updatedResponse = await cache.match(updatedURL);
    //     if (updatedResponse) {
    //       const updatedText = await updatedResponse.text();
    //       console.log(updatedText);
    //     }
    //     console.groupEnd();
    //   }
    // });
  }
}

/*****************************************************************
 * Add image background to the footer
 * ****************************************************************/

const loadFooter = () => {
 var widthem= window.innerWidth / parseFloat(
  getComputedStyle(
    document.querySelector('html')
  )['font-size']
);
 
  let backgroundImageWidth = Math.ceil(window.viewport_width *2.6/ 20) * 20;
  if(widthem>40) backgroundImageWidth = Math.ceil(window.viewport_width*1.7 / 20) * 20;
  if(widthem>80) backgroundImageWidth = Math.ceil(window.viewport_width / 20) * 20;
  
  let limbes = `url('https://res.cloudinary.com/mmontevil/image/fetch/c_limit,f_auto,q_auto,w_${backgroundImageWidth}/https://montevil.org/assets/limbes2.jpg')`;
 /* let limbes = `url('/assets/limbes5.jpg')`;

  let footer = window.document.querySelector('#footer');
  footer.style.setProperty('--limbes', limbes);
  footer.style.color = '#fff';
  //let imageRatio = Math.round((670 / 1534) * 100);
 // let imageRatio = Math.round((581 / 798) * 100);
  let imageRatio = ((535 / 798) * 100);
  
  footer.style.padding = `calc(${imageRatio}vw) 0 1em 0`;
  footer.style.marginLeft = `auto`;
  footer.style.marginRight = `auto`;
footer.style.width = `min(100%, 1200px)`;
    footer.style.padding = `calc(min(calc(${imageRatio}vw), calc(${imageRatio}*12px))) 0 1em 0`;
*/
  //  let limbes = `url('/assets/limbes11.jpg')`;

  let footer = window.document.querySelector('#footer');
  footer.style.setProperty('--limbes', limbes);
  footer.style.color = '#fff';
  //let imageRatio = Math.round((670 / 1534) * 100);
 // let imageRatio = Math.round((581 / 798) * 100);
  let imageRatio = ((868 / 900) * 100);
  
  footer.style.padding = `calc((868 / (var(--footerW))* 100vw) ) 0 1em 0`;
};

/*****************************************************************
 * Load lazy loaded images
 * ****************************************************************/

const loadImage = (img) => {
  if (img.getAttribute('data-srcset')) {
    img.setAttribute('srcset', img.getAttribute('data-srcset'));
  }
  img.setAttribute('src', img.getAttribute('data-src'));
};

/*****************************************************************
 * Lazyload additional HTML
 * ****************************************************************/

// TODO: manage multiple lazy containers with content URL from data-href
const lazyHtmlElement = document.querySelector('.lazy');

const lazyHtml = () => {
  if (lazyHtmlElement) {
    let path = new URL(window.location).pathname;
    fetch(`/lazy${path}`)
      .then((response) => response.text())
      .then((html) => {
        lazyHtmlElement.innerHTML = html;
      })
      .catch(function (err) {
        console.warn('Something went wrong with HTML lazyload.', err);
      });
  }
};

/*****************************************************************
 * Lazyload some images, the footer background, and some HTML
 * ****************************************************************/

// Inspired by https://www.zachleat.com/web/facepile/

if (!saveData) {
  // Lazyload additional content only if not in save data mode

  if (observable) {
    // Lazyload images
    // ************************************************************/
    const lazyImages = document.querySelectorAll('img[data-src]');
    const lazyImagesCallback = (changes) => {
      changes.forEach((change) => {
        if (change.isIntersecting) {
          lazyImagesObserver.unobserve(change.target);
          loadImage(change.target);
        }
      });
    };
    const lazyImagesOptions = {
      // If the image gets within 300px in the Y axis, start the download.
      rootMargin: '300px 0px 300px 0px',
      threshold: 0.01,
    };
    let lazyImagesObserver = new IntersectionObserver(
      lazyImagesCallback,
      lazyImagesOptions
    );
    lazyImages.forEach((img) => {
      lazyImagesObserver.observe(img);
    });

    // Lazyload additional HTML content
    // ************************************************************/
    if (lazyHtmlElement) {
      const lazyHtmlCallback = (changes) => {
        changes.forEach((change) => {
          if (change.isIntersecting) {
            lazyHtmlObserver.unobserve(change.target);
            lazyHtml();
          }
        });
      };
      const lazyHtmlOptions = {
        // If the image gets within 500px in the Y axis, start the download.
        rootMargin: '500px 0px 0px 0px',
        threshold: 0.01,
      };
      let lazyHtmlObserver = new IntersectionObserver(
        lazyHtmlCallback,
        lazyHtmlOptions
      );
      lazyHtmlObserver.observe(lazyHtmlElement);
    }

    // Lazyload footer background
    // ************************************************************/
    if (window.viewport_width > 0) {
      const lazyFooter = document.querySelector('#footer');
      const lazyFooterCallback = (changes) => {
        changes.forEach((change) => {
          if (change.isIntersecting) {
            lazyFooterObserver.unobserve(change.target);
            loadFooter();
          }
        });
      };
      const lazyFooterOptions = {
        // If the image gets within 500px in the Y axis, start the download.
        rootMargin: '500px 0px 0px 0px',
        threshold: 0.01,
      };
      let lazyFooterObserver = new IntersectionObserver(
        lazyFooterCallback,
        lazyFooterOptions
      );
      lazyFooterObserver.observe(lazyFooter);
    }
  } else {
    // No IntersectionObserver support => no lazyloading

    // Load images
    document.querySelectorAll('img[data-src]').forEach((img) => {
      loadImage(img);
    });

    // Load additional HTML content
    if (lazyHtmlElement) {
      lazyHtml();
    }

    // Load footer background
    if (window.viewport_width > 0) {
      loadFooter();
    }
  }
}

/*****************************************************************
 * Autoplay Giphy videos when possible
 * ****************************************************************/

// TODO: use IntersectionObserver to play the video only when visible in the viewport?
let gifs = document.querySelectorAll('.giphy video');
let gifsNumber = gifs.length;

if (gifsNumber > 0) {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion)');
  var prefersReducedMotionNoPreference = window.matchMedia(
    '(prefers-reduced-motion: no-preference)'
  );
  function handleReducedMotionChanged() {
    for (let i = 0; i < gifsNumber; ++i) {
      if (prefersReducedMotionNoPreference.matches) {
        gifs[i].play();
      } else {
        gifs[i].pause();
      }
    }
  }

  // trigger this once on load to set up the initial value
  handleReducedMotionChanged();

  // Note: https://webkit.org/b/168491
  prefersReducedMotion.addListener(handleReducedMotionChanged);
}

/*****************************************************************
 * Deal with offline/online events
 * ****************************************************************/

// https://mxb.at/blog/youre-offline/
// https://www.youtube.com/watch?v=7fnpsF9tMXc

var isOffline = false;

// check if we're online, set a class on <body> if offline
function updateConnectivityStatus() {
  var notificationToShow = false;
  var notificationIcon = '';
  var notificationType = '';
  var notificationText = '';

  if (typeof navigator.onLine !== 'undefined') {
    if (!navigator.onLine) {
      notificationToShow = true;
      notificationIcon = 'offline';
      if ('serviceWorker' in navigator) {
        // If the browser supports Service Workers and the Cache API,
        // getting offline should be less stressful. Use a "warning"
        // message instead of an "error and provide a link to content
        // available in cache.

        // TODO: check if SW active and some content in cache
        notificationType = 'warning';
        notificationText =
          'It looks like <strong>the connection is lost</strong>. Continue reading this page, or look at <a href="/offline.html">other contents you can read while offline</a>.';
      } else {
        notificationType = 'error';
        notificationText =
          'It looks like <strong>the connection is lost</strong>. Continue reading this page, until the connection is back.';
      }
      isOffline = true;
    } else {
      if (isOffline) {
        isOffline = false;
        notificationIcon = 'online';
        notificationToShow = true;
        notificationType = 'success';
        notificationText =
          '<strong>You are back online!</strong> You can resume your navigation on the website.';
      }
    }

    if (notificationToShow) {
      Toast({
        text: notificationText,
        type: notificationType,
        icon: notificationIcon,
        duration: 7000,
      }).showToast();
    }
  }
}

// listen for future changes in connection
function checkConnectivity() {
  window.addEventListener('online', updateConnectivityStatus);
  window.addEventListener('offline', updateConnectivityStatus);
  updateConnectivityStatus();
}

// when the page has finished loading,
window.addEventListener('load', checkConnectivity);

