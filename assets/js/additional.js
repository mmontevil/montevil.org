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

















var annytab = annytab || {};

annytab.effects = (function () {
    'use_strict';
    // Public methods
    return {
        slideDown: function (el, duration, display) {
            // Return if the element is visible
            if (this.isVisible(el) === true) {
                return;
            }
            // Set default values for parameters
            duration = duration || 1000;
            display = display || 'flex';
            // Display the element
            el.style.display = display;
            // Create variables
            var start = null;
            var height = el.offsetHeight;
            var overflow = el.style.overflow;
            // Set height and hide overflow
            el.style.height = '0';
            el.style.overflow = 'hidden';
            // Run animation
            function run(timestamp)
            {
                // Set start time
                if (!start) start = timestamp;
                // Calculate progress
                var progress = height * ((timestamp - start) / duration);
                // Set element height
                el.style.height = Math.min(progress, height) + 'px';
                // Check if the animation should end
                if (progress < height)
                {
                    window.requestAnimationFrame(run);
                }
                else
                {
                    // Reset element
                    el.style.height = '';
                    el.style.overflow = overflow;
                }
            }
            // Start animation
            window.requestAnimationFrame(run);
            // Return the element
            return el;
        },
        slideUp: function (el, duration) {
            // Return if the element not is visible
            if (this.isVisible(el) === false) {
                return;
            }
            // Set default values for parameters
            duration = duration || 1000;
            // Create variables
            var start = null;
            var height = el.offsetHeight;
            var overflow = el.style.overflow;
            // Hide overflow
            el.style.overflow = 'hidden';
            // Run animation
            function run(timestamp)
            {
                // Set start time
                if (!start) start = timestamp;
                // Calculate progress
                var progress = height - (height * ((timestamp - start) / duration));
                // Set element height
                el.style.height = Math.max(progress, 0) + 'px';
                // Check if the animation should end
                if (progress > 0)
                {
                    window.requestAnimationFrame(run);
                }
                else
                {
                    // Reset element
                    el.style.display = 'none';
                    el.style.height = '';
                    el.style.overflow = overflow;
                }
            }
            // Start animation
            window.requestAnimationFrame(run);
            // Return the element
            return el;
        },
        slideToggle: function (el, duration, display) {
            // Set default values for parameters
            duration = duration || 1000;
            display = display || 'inline-block';
            // Check if we should slide up or slide down
            if (this.isVisible(el) === true) {
                this.slideUp(el, duration);
            }
            else {
                this.slideDown(el, duration, display);
            }
            // Return the element
            return el;
        },
        fadeIn: function (el, duration, display) {
            // Return if the element is visible
            if (this.isVisible(el) === true) {
                return;
            }
            // Set default values for parameters
            duration = duration || 1000;
            display = display || 'inline-block';
            // Display the element
            el.style.display = display;
            // Create variables
            var start = null;
            // Set opacity
            el.style.opacity = 0.00;
            el.style.filter = 'alpha(opacity=0)'; /* For IE8 and earlier */
            // Run animation
            function run(timestamp)
            {
                // Set start time
                if (!start) start = timestamp;
                // Calculate progress
                var progress = 100 * (timestamp - start) / duration;
                // Set element opacity
                el.style.opacity = Math.min(progress, 100) / 100;
                el.style.filter = 'alpha(opacity=' + Math.min(progress, 100) + ')'; /* For IE8 and earlier */
                // Check if the animation should end
                if (progress < 100) {
                    window.requestAnimationFrame(run);
                }
                else {
                    // Reset element
                    el.style.opacity = '';
                    el.style.filter = ''; /* For IE8 and earlier */
                }
            }
            // Start animation
            window.requestAnimationFrame(run);
            // Return the element
            return el;
        },
        fadeOut: function (el, duration) {
            // Return if the element not is visible
            if (this.isVisible(el) === false) {
                return;
            }
            // Set default values for parameters
            duration = duration || 1000;
            // Create variables
            var start = null;
            // Set opacity
            el.style.opacity = 1.00;
            el.style.filter = 'alpha(opacity=100)'; /* For IE8 and earlier */
            // Run animation
            function run(timestamp)
            {
                // Set start time
                if (!start) start = timestamp;
                // Calculate progress
                var progress = 100 - (100 * ((timestamp - start) / duration));
                // Set element opacity
                el.style.opacity = Math.max(progress, 0) / 100;
                el.style.filter = 'alpha(opacity=' + Math.max(progress, 0) + ')'; /* For IE8 and earlier */
                // Check if the animation should end
                if (progress > 0)
                {
                    window.requestAnimationFrame(run);
                }
                else {
                    // Reset element
                    el.style.display = 'none';
                    el.style.opacity = '';
                    el.style.filter = ''; /* For IE8 and earlier */
                }
            }
            // Start animation
            window.requestAnimationFrame(run);
            // Return the element
            return el;
        },
        fadeToggle: function (el, duration, display) {
            // Set default values for parameters
            duration = duration || 1000;
            display = display || 'inline-block';
            // Check if we should fade out or fade in
            if (this.isVisible(el) === true) {
                this.fadeOut(el, duration);
            }
            else {
                this.fadeIn(el, duration, display);
            }
            // Return the element
            return el;
        },
        isVisible: function (el) {
            if (typeof el === 'undefined' || el === null) { return false; }
            return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        }
    };
})();


annytab.lightbox = (function () {
    'use_strict';
    // Constructor
    function lightbox(opts)
    {
        // Set default values for parameters
        opts = opts || {};
        // Set options
        this.options = { selector: '.annytab-lightbox-popup', fade_duration: 1000, close_click_outside: true, slideshow: true, slideshow_interval: 10000 };
        for (var option in this.options) {
            if (opts.hasOwnProperty(option) === true) {
                this.options[option] = opts[option];
            }
        }
        // Set variables
        resetVariables(this);
        // Get all links that should have a lightbox
        var links = document.querySelectorAll(this.options.selector);
        // Add events
        addLinkEvents(this, links);
    } // End of the constructor
    // Reset variables to default values
    function resetVariables(lb)
    {
        lb.image0 = null;
        lb.wrapper = null;
        lb.padding = null;

        lb.current_slide = null;
        lb.last_slide = null;
        lb.container = null;
        lb.wrapper = null;
        lb.close_button = null;
         lb.zoom_button = null;
        lb.automatic_slideshow = null;
        lb.left_arrow = null;
        lb.right_arrow = null;
        lb.caption_container = null;
    //    lb.touchControl.unbindEvents();
        lb.touchControl= null;
        /*        lb.image0= null;
                lb.padding= null;
                lb.margin= null;*/

    } // End of the resetVariables method
    // Add events
    function addLinkEvents(lb, links)
    {
        // Loop links
        for (var i = 0; i < links.length; i++)
        {
            // Add a click event
            window.onload = links[i].addEventListener('click', function (event) {
                // Prevent default click behaviour
                event.preventDefault();
                // Open the lightbox
                lb.open(this);
            }, false);
        }
    } // End of the addLinkEvents method
    // Add container events
    function addContainerEvents(lb)
    {
        // Add a close event
        window.onload = lb.close_button.addEventListener('click', function (event) {
            // Prevent default click behaviour
            event.preventDefault();
            // Close the lightbox
            lb.close();
        }, false);
        
        window.onload = lb.zoom_button.addEventListener('click', function (event) {
            // Prevent default click behaviour
            event.preventDefault();
            // Close the lightbox
            lb.zoom();
        }, false);        
        
        // Add a close event
        if (lb.options.close_click_outside === true)
        {
            window.onload = lb.container.addEventListener('click', function (event) {
                // Prevent default click behaviour
                event.preventDefault();
                // Close the lightbox
                if (event.target.contains(lb.wrapper) === true)
                {
                    lb.close();
                }
            }, false);
        }
        // Add paging if there is more than 1 slide
        if (lb.last_slide > 0)
        {
            // Show arrows
            lb.left_arrow.style.display = 'block';
            lb.right_arrow.style.display = 'block';
            // Add left arrow click event
            window.onload = lb.left_arrow.addEventListener('click', function (event) {
                // Prevent default click behaviour
                event.preventDefault();
                // Show the previous slide
                lb.showSlide(-1);
                // Turn of the slideshow
                clearInterval(lb.automatic_slideshow);
            }, false);
            // Add right arrow click event
            window.onload = lb.right_arrow.addEventListener('click', function (event) {
                // Prevent default click behaviour
                event.preventDefault();
                // Show the next slide
                lb.showSlide(1);
                // Turn of the slideshow
                clearInterval(lb.automatic_slideshow);
            }, false);
            // Create a slideshow
            if (lb.options.slideshow === true)
            {
                lb.automatic_slideshow = setInterval(function () { lb.showSlide(1); }, lb.options.slideshow_interval);
            }
        }
        else
        {
            // Hide arrows
            lb.left_arrow.style.display = 'none';
            lb.right_arrow.style.display = 'none';
        }
    } // End of the addContainerEvents method
    // Show a slide
    lightbox.prototype.showSlide = function (step)
    {
        // Set the current slide
        this.current_slide += step;
        // Make sure that the slide id not is outside borders
        if (this.current_slide > this.last_slide) {
            this.current_slide = parseInt(0);
        }
        if (this.current_slide < 0) {
            this.current_slide = parseInt(this.last_slide);
        }
        // Get slides
        var slides = this.container.querySelectorAll('.annytab-lightbox-image');
        var next_slide = this.container.querySelector('img[data-lightbox-id="' + this.current_slide + '"]');
        // Set a caption
        var caption = next_slide.getAttribute('data-lightbox-caption');
        if (caption !== null)
        {
            this.caption_container.innerHTML = unescape(caption);
            this.caption_container.style.display = 'inline-block';
        }
        else
        {
            this.caption_container.style.display = 'none';
        }
        // Hide slides
        for (var i = 0; i < slides.length; i++)
        {
            slides[i].style.display = 'none';
        }
        // Fade in the next slide
        annytab.effects.fadeIn(next_slide, this.options.fade_duration, 'inline-block');
    }; // End of the showSlide method
    // Open a lightbox
    lightbox.prototype.open = function (link)
    {
        // Get the href attribute
        var href = link.getAttribute('href');
        // Get the group
        var group = link.getAttribute('data-lightbox-group');
        // Get the caption
        var caption = link.getAttribute('data-lightbox-caption');
        var classes = link.getAttribute('data-lightbox-classes');
        // Add the first image
        var source = '<img id="lighbox-img" data-lightbox-id="0" src="' + href + '" class="annytab-lightbox-image '+ classes + '" alt="image" style="display:none;"';
        source += caption !== null ? ' data-lightbox-caption="' + caption : '';
        source += '" />';
        // Create a counter
        var counter = 1;
        // Find all images in the group
        var images = document.querySelectorAll('[data-lightbox-group="' + group + '"]');
        // Loop images
        for (var i = 0; i < images.length; i++)
        {
            var url = images[i].getAttribute('href');
            if (url !== href)
            {
                source += '<img data-lightbox-id="' + counter + '" src="' + url + '" class="annytab-lightbox-image '+ classes + '" alt="image" style="display:none;"';
                source += images[i].getAttribute('data-lightbox-caption') !== null ? ' data-lightbox-caption="' + images[i].getAttribute('data-lightbox-caption') : '';
                source += '" />';
                counter += 1;
            }
        }
        
        // Get the last slide and set the current slide
        this.last_slide = counter - 1;
        this.current_slide = parseInt(-1);
        // Create a lightbox
        this.container = document.createElement('div');
        this.container.setAttribute('class', 'annytab-lightbox-container');
        this.container.insertAdjacentHTML('beforeend', '<div class="annytab-lightbox-margin">'
            + '<div class="annytab-lightbox-wrapper">'
            + '<div class="annytab-lightbox-padding" ><div id="lighbox-cont">'
            + source
            + '</div><div class="annytab-lightbox-left-arrow"><i class="fas fa-angle-left"></i></div>'
            + '<div class="annytab-lightbox-right-arrow"><i class="fas fa-angle-right"></i></div>'
            + '</div></div>'+ '<div class="annytab-lightbox-caption"></div>'
            +'</div>'
            + '<div class="annytab-lightbox-close"></div >'
              + '<div class="annytab-lightbox-zoom">+</div >'  );
        document.body.appendChild(this.container);
        // Get references
                        this.padding = this.container.querySelector('.annytab-lightbox-padding');

                this.margin = this.container.querySelector('.annytab-lightbox-margin');
this.image0 = this.container.querySelector('.annytab-lightbox-image');
        this.wrapper = this.container.querySelector('.annytab-lightbox-wrapper');
        this.close_button = this.container.querySelector('.annytab-lightbox-close');
                this.zoom_button = this.container.querySelector('.annytab-lightbox-zoom');
        this.caption_container = this.container.querySelector('.annytab-lightbox-caption');
        this.left_arrow = this.container.querySelector('.annytab-lightbox-left-arrow');
        this.right_arrow = this.container.querySelector('.annytab-lightbox-right-arrow');
        this.zoomed=false;
        // Fade in the container
        annytab.effects.fadeIn(this.container, this.options.fade_duration, 'block');
        // Add container events
        addContainerEvents(this);
        // Show the next slide
        this.showSlide(1);
        
     /*   this.touchControl = new ImageMove('lighbox-cont', 'lighbox-img');
       this.touchControl.addPanEvents();*/
       
    /*    this.touchControl = new touchScriptController(
        this.image0,   // Image Element
       this.padding );*//*,   // Parent Container Element
        {                                       // Options to preset the scale and translate
            scale: 1,
            translateX: 0,
            translateY: 0
        }*/
        
        
    }; // End of the open method
    // Close a lightbox
    lightbox.prototype.close = function () {
        // Turn of the slideshow
        clearInterval(this.automatic_slideshow);
        // Fade out the container
        annytab.effects.fadeOut(this.container, this.options.fade_duration);
        // Remove the container
        var box = this.container;
        if(this.touchControl)
                this.touchControl.removePanEvents();

        setTimeout(function ()
        {
            document.body.removeChild(box);
        }, this.options.fade_duration);
        
        // Reset variables (GC)
        resetVariables(this);
    }; 
    
    lightbox.prototype.zoom = function () {
      if(this.zoomed){ 
        this.touchControl.removePanEvents();
        this.touchContro=null;
        this.zoomed=false;
        this.image0.setAttribute('style',"");
      //  this.wrapper.setAttribute('style',"width: 100%");
      }else{this.zoomed=true;
    //    this.wrapper.setAttribute('style',"width: max-content");
        //this.margin.setAttribute('style',"justify-content: flex-start");
        this.image0.setAttribute('style',"max-width: max-content;max-height: max-content");
        this.touchControl = new ImageMove('lighbox-cont', 'lighbox-img');
       this.touchControl.addPanEvents();
      }
       
    };     
    
    // End of the close method
    // Return this object
    return lightbox;
})();
    var lightbox = new annytab.lightbox({ selector: '.glightbox', fade_duration: 300, close_click_outside: true, slideshow: true, slideshow_interval: 10000 });

    
    /*
function touchScriptController(element, parentElement, options) {
    var mouseDown = false, scaling = false;
    var startX = 0, startY = 0;
    
    var adjustScale = 1, adjustDeltaX = 0, adjustDeltaY = 0;
    var currentScale = 1, currentDeltaX = 0, currentDeltaY = 0;

    var hypo = undefined;
    var vpRect = parentElement.getBoundingClientRect();

    function addListenerMulti(elem, eventNames, listener) {
        var events = eventNames.split(' ');
        for (var i=0, iLen=events.length; i<iLen; i++) {
            elem.addEventListener(events[i], listener, false);
        }
    }
    function removeListenerMulti(elem, eventNames, listener) {
        var events = eventNames.split(' ');
        for (var i=0, iLen=events.length; i<iLen; i++) {
            elem.removeEventListener(events[i], listener, false);
        }
    }
    function adjustImageRect() {

        let imgRatio = element.naturalWidth / element.naturalHeight;
        let vpRatio = parentElement.clientWidth / parentElement.clientHeight;

        if(imgRatio < vpRatio) {
            element.style.width = "100%";
        } else {
            element.style.height = "100%";
        }
    }

    function setTransform() {
        let transforms = [];
    
        transforms.push(`scale(${currentScale})`);
        transforms.push(`translate(${currentDeltaX}px, ${currentDeltaY}px)`);
    
        element.style.transform = transforms.join(' ');
    }

    function setConstraints(deltaX, deltaY) {

        if (currentScale < 1) {
            currentScale = 1;
            currentDeltaX = 0;
            currentDeltaY = 0;
            return;
        }

        let imgRect = element.getBoundingClientRect();
        
        if (vpRect.top > imgRect.top + deltaY && vpRect.bottom < imgRect.bottom + deltaY) {
            currentDeltaY = adjustDeltaY + (deltaY / currentScale);
        } 

        if (vpRect.left > imgRect.left + deltaX && vpRect.right < imgRect.right + deltaX) {
            currentDeltaX = adjustDeltaX + (deltaX / currentScale);
        } 
    }

    
    function bindEvents() {
        addListenerMulti(element, 'touchstart mousedown', handleTouchStart);
        
        addListenerMulti(element, 'touchmove mousemove', handleTouchMove);
        
        addListenerMulti(element, 'touchend mouseup', handleTouchEnd);
        
        addListenerMulti(element, 'touchcancel mouseout', handleTouchCancel);
        
        addListenerMulti(element, 'wheel', handleWheel);
    }
        function unbindEvents() {
        removeListenerMulti(element, 'touchstart mousedown', handleTouchStart);
        
        removeListenerMulti(element, 'touchmove mousemove', handleTouchMove);
        
        removeListenerMulti(element, 'touchend mouseup', handleTouchEnd);
        
        removeListenerMulti(element, 'touchcancel mouseout', handleTouchCancel);
        
        removeListenerMulti(element, 'wheel', handleWheel);
    }
    
    
    function handleTouchStart(e) {
        e.preventDefault();
        
        mouseDown = (e.type === 'mousedown');
    
        startX = e.clientX || e.touches[0].clientX;
        startY = e.clientY || e.touches[0].clientY;   
        
        scaling = (e.touches && e.touches.length === 2);
    }

    function handleTouchMove(e) {
        e.preventDefault();
        if(e.type === 'mousemove' && !mouseDown) { return false; }
    
        var deltaX, deltaY, scale = 1;
    
        deltaX = (e.clientX || e.changedTouches[0].clientX) - startX;
        deltaY = (e.clientY || e.changedTouches[0].clientY) - startY;
    
    
        if(scaling) {
            scale = currentScale;
            deltaX = 0, deltaY = 0, wasScaling = true;
            let hypoTouchMove = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY);
    
            if(hypo === undefined) {
                hypo = hypoTouchMove;
            }
    
            scale = hypoTouchMove / hypo;
            currentScale = adjustScale * scale;
        }         
        
        
        setConstraints(deltaX, deltaY);
        setTransform();
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        mouseDown = !(e.type === 'mouseup');
        
        adjustScale = currentScale;
        adjustDeltaX = currentDeltaX;
        adjustDeltaY = currentDeltaY;
        hypo = undefined;
        scaling = false;
    }

    function handleTouchCancel(e) {
        e.preventDefault();
        
        adjustScale = currentScale;
        adjustDeltaX = currentDeltaX;
        adjustDeltaY = currentDeltaY;
        hypo = undefined;
        scaling = false;
        mouseDown = false;
    }

    function handleWheel(e) {
        currentScale += event.deltaY * -0.02;
        adjustScale = currentScale;
        setConstraints();
        setTransform();
    }
    
    function init() {

        if(options) {
            currentScale = adjustScale = options.scale || 1;
            currentDeltaX = adjustDeltaX = options.translateX || 0; 
            currentDeltaY = adjustDeltaY = options.translateY || 0;

            setTransform();
        }
    
        adjustImageRect();
        unbindEvents() 
        bindEvents();
    }
    
    init();
}

*/




















(function(win, doc, DomFunctionalityClass) {
    var domFunctionality = new DomFunctionalityClass(doc),
        imgContainer,
        imgElement,
        DRAGGGING_STARTED = 0,
        LAST_MOUSE_POSITION,
        DIV_OFFSET,
        CONTAINER_WIDTH,
        CONTAINER_HEIGHT,
        IMAGE_WIDTH,
        IMAGE_HEIGHT,
        ImageContainerElement,
        thisObjOfimageMove,
        /*
         * @desc: main core class to add custom events on specied image element. This class contains
         * two methods. 
         * 1.addPanEvents : For adding pan related events on image element.
         * 2.removePanEvents: To remove pan related events from image element.
         * @param {string} imgContainerId - Id of image container
         * @param {string} imgId - Id of image element
         */
        imageMove = function(imgContainerId, imgId) {
            thisObjOfimageMove = this;
            thisObjOfimageMove.imgContainerId = imgContainerId;
            thisObjOfimageMove.imgId = imgId;
            thisObjOfimageMove.addPanEvents = function() {
                thisObjOfimageMove.customeventName = 'pan';
                /*
                 * Call addCustomEvents in the context of instance of imageMove class.
                 * Main reason to do this : 
                 * acess imgContainerId, imgId, customeventName varibale in the callBack function (which pass to 
                 * onready method of domFunctionality class) without passing the variable as parameter. Instead of
                 * passing parameter, we assign the variables in 'this' object of imageMove class and we call the callBack
                 * function in the context of 'this' object of imageMove class.
                 */
                addCustomEvents.call(thisObjOfimageMove);
            };
            thisObjOfimageMove.removePanEvents = function() {
                thisObjOfimageMove.customeventName = 'pan';
                removeCustomEvents.call(thisObjOfimageMove);
            };
        },
        addCustomEvents = function() {
            domFunctionality.onready(function() {
                // Take custom event object from EVENT_MAP.
                var customEventObj = EVENT_MAP[this.customeventName];
                imgContainer = domFunctionality._(this.imgContainerId);
                imgElement = domFunctionality._(this.imgId);
                DIV_OFFSET = imgContainer.getOffSet();
                CONTAINER_WIDTH = imgContainer.getOuterWidth();
                CONTAINER_HEIGHT = imgContainer.getOuterHeight();
                IMAGE_WIDTH = imgElement.getOuterWidth();
                IMAGE_HEIGHT = imgElement.getOuterHeight();
                ImageContainerElement = imgContainer.element;
                domFunctionality.addEventFromElement(ImageContainerElement, customEventObj);
            }, this);
        },
        removeCustomEvents = function() {
            var customEventObj = EVENT_MAP[this.customeventName];
            domFunctionality.removeEventFromElement(ImageContainerElement, customEventObj);
        },
        touchStart = function(event) {
            event.stopPropagation();
            event.preventDefault();
            var xpos,
                ypos;
            event.clientX ? (xpos = event['clientX'], ypos = event['clientY']) : (xpos = event.touches[0].pageX,
                ypos = event.touches[0].pageY);
            DRAGGGING_STARTED = 1;
            LAST_MOUSE_POSITION = { x: xpos - DIV_OFFSET.left, y: ypos - DIV_OFFSET.top };
        },
        touchEnd = function(event) {
            event.stopPropagation();
            event.preventDefault();
            DRAGGGING_STARTED = 0;
        },
        touchMove = function(event) {
            event.stopPropagation();
            event.preventDefault();
            var current_mouse_position,
                change_x,
                change_y,
                img_top,
                img_left,
                img_top_new,
                img_left_new,
                curr_x_pos,
                curr_y_pos;
            if (DRAGGGING_STARTED == 1) {
                event.clientX ? (curr_x_pos = event['clientX'], curr_y_pos = event['clientY']) : (curr_x_pos = event.touches[0].pageX,
                    curr_y_pos = event.touches[0].pageY);
                current_mouse_position = { x: curr_x_pos - DIV_OFFSET.left, y: curr_y_pos - DIV_OFFSET.top };
                change_x = current_mouse_position.x - LAST_MOUSE_POSITION.x;
                change_y = current_mouse_position.y - LAST_MOUSE_POSITION.y;
                LAST_MOUSE_POSITION = current_mouse_position;
                img_top = parseInt(imgElement.getSetCss('top'), 10);
                img_left = parseInt(imgElement.getSetCss('left'), 10);
                img_top_new = img_top + change_y;
                img_left_new = img_left + change_x;
                // Validate top and left, otherwise white space will be seen.
                (img_top_new > 0) && (img_top_new = 0);
                (img_top_new < (CONTAINER_HEIGHT - IMAGE_HEIGHT)) && (img_top_new = CONTAINER_HEIGHT - IMAGE_HEIGHT);
                (img_left_new > 0) && (img_left_new = 0);
                (img_left_new < (CONTAINER_WIDTH - IMAGE_WIDTH)) && (img_left_new = CONTAINER_WIDTH - IMAGE_WIDTH);
                imgElement.getSetCss({ top: img_top_new + 'px', left: img_left_new + 'px' });
                (event.clientX > CONTAINER_WIDTH || event.clientY > CONTAINER_HEIGHT) && (DRAGGGING_STARTED = 0);
            }
        },
        EVENT_MAP = {
            pan: {
                touchstart: touchStart,
                touchend: touchEnd,
                touchmove: touchMove,
                mousedown: touchStart,
                mouseup: touchEnd,
                mousemove: touchMove
            }
        };
    // addEventListener ployfill for IE-8
    (typeof win.addEventListener === 'undefined') && (function() {
        var registry = [],
            addEvent = function(type, listner) {
                var target = this;
                registry.unshift({
                    _listner: function(event) {
                        event.preventDefault = function() {
                            event.returnValue = false;
                        };
                        event.stopPropagation = function() {
                            event.cancelBubble = true;
                        };
                        listner.call(target, event);
                    },
                    listener: listener,
                    target: target,
                    type: type
                });
                target.attachEvent("on" + type, registry[0].__listener);
            },
            removeEvent = function(type, listner) {
                for (var index = 0; index < registry.length; index++) {
                    if (registry[index].target === this && registry[index].type === type && registry[index].listner === listner) {
                        return this.detachEvent("on" + type, registry.splice(index, 1)[0].__listener);
                    }
                }
            };
        win.Element.prototype.addEventListener = addEvent;
        win.Element.prototype.removeEventListener = removeEvent;
    })();
    win['ImageMove'] = imageMove;
})(typeof window !== 'undefined' ? window : null, typeof document !== 'undefined' ? document : null,
    function(doc) {
        var globalObj = this,
            exportedObj = {
                /*
                 * _ use to select element by id.
                 * @param {string} id Element Id
                 * @return {Object} reference of chaining methods.  
                 */
                _: function(id) {
                    var element = doc.getElementById(id),
                        deepCopyOfglobalObj;
                    globalObj.element = element;
                    deepCopyOfglobalObj = deepCopyOfRef(globalObj);
                    return deepCopyOfglobalObj;
                },
                getOffSet: function() {
                    var element = this.element,
                        rect = element.getBoundingClientRect();
                    return {
                        top: rect.top + doc.body.scrollTop,
                        left: rect.left + doc.body.scrollLeft
                    }
                },
                getOuterWidth: function() {
                    var element = this.element;
                    return element.offsetWidth;
                },
                getOuterHeight: function() {
                    var element = this.element;
                    return element.offsetHeight;
                },
                /*
                 * getSetCss use to get css value or either set css style.
                 * @param {string || object} value - It can be rulename or css style.
                 */
                getSetCss: function(value) {
                    var element = this.element,
                        cssValue;
                    if (typeof value === 'object') {
                        convertToJSStyleCss(value);
                        for (var prop in value) {
                            element.style[prop] = value[prop];
                        }
                    } else {
                        cssValue = typeof getComputedStyle !== 'undefined' ? getComputedStyle(element)[value] : element.currentStyle[value];
                        !isNaN(parseInt(cssValue)) ? cssValue = cssValue : cssValue = '0px';
                        return cssValue;
                    }
                },
                /*
                 * onready use to call the function after state is in complete mode.
                 * @parem {Function} callBack- callback function
                 * @param {object} context - on which callback function will be executed.
                 */
                onready: function(callBack, context) {
                    doc.readyState !== "complete" ?
                        doc.onreadystatechange = function() {
                            if (doc.readyState == "complete") {
                                callBack.call(context);
                            }
                        } : callBack.call(context);
                },
                /*
                 */
                addEventFromElement: function(element, events) {
                    var eventName;
                    for (eventName in events) {
                        (events.hasOwnProperty(eventName)) &&
                        (element.addEventListener(eventName, events[eventName]));
                    }
                },
                removeEventFromElement: function(element, events) {
                    var eventName;
                    for (eventName in events) {
                        (events.hasOwnProperty(eventName)) &&
                        (element.removeEventListener(eventName, events[eventName]));
                    }
                }
            },
            convertToUpperCase = function(value) {
                var arr = value.split('-');
                if (arr.length === 1) {
                    return value;
                } else {
                    for (var i = 1; i < arr.length; i++) {
                        arr[i] = capitalize(arr[i]);
                    }
                    arr = arr.join('');
                    return arr;
                }
            },
            deepCopyOfRef = function(obj) {
                var temp = {};
                for (var pro in obj) {
                    if (obj.hasOwnProperty(pro)) {
                        temp[pro] = obj[pro];
                    }
                }
                return temp;
            },
            capitalize = function(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            },
            convertToJSStyleCss = function(obj) {
                var newKey;
                for (var oldKey in obj) {
                    if (obj.hasOwnProperty(oldKey)) {
                        newKey = convertToUpperCase(oldKey);
                        if (newKey !== oldKey) {
                            obj[newKey] = obj[oldKey];
                            delete obj[oldKey];
                        }
                    }
                }
            };
        for (var item in exportedObj) {
            if (exportedObj.hasOwnProperty(item)) {
                globalObj[item] = exportedObj[item];
            }
        }
    }
)
