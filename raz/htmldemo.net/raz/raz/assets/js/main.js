(function ($) {
    "use strict";
/*--
Commons Variables
-----------------------------------*/
var windows = $(window);

/*--
     Preloadder   
-----------------------------------*/

$(window).load(function () {
    setTimeout(function () {
        $('body').addClass('loaded');
    }, 1000);

})
$(".la-image-loading .submit-btn").on("click", function () {
    $(".la-image-loading").fadeOut();
})
    
  /*--
    	Click Shopping Cart 
 -----------------------------------*/

function ClcickCart() {
    var body = 'body';
    $('.cart-trigger').on('click', function (e) {
        e.preventDefault(),
            $(body).addClass('open-cart-aside');
    })
    $('.btn-close-cart').on('click', function (e) {
        e.preventDefault(),
            $(body).removeClass('open-cart-aside');
    })
    $('.search-flyoveray').on('click', function (e) {
        e.preventDefault(),
            $(body).removeClass('open-cart-aside');
    })
}
ClcickCart();



/*--
    Search Option
 -----------------------------------*/

function searchoption() {
    $('.search-trigger').on('click', function (e) {
        e.preventDefault(),
            $('.search-flyoverlay-area').addClass('is-visible');
    })
    $('.btn-close-search').on('click', function (e) {
        e.preventDefault(),
            $(this).parent('.search-flyoverlay-area').removeClass('is-visible')
    })
}
searchoption();



/*--
    Hambargur Option
 -----------------------------------*/

function hamburgerOption(params) {
    $('.hamburger-trigger').on('click', function (e) {
        e.preventDefault(),
            $('.hamburger-area').addClass('is-visible');
            $(this).addClass('open');
            
    })
    $('.btn-close-search').on('click', function (e) {
        e.preventDefault(),
            $(this).parent('.hamburger-area').removeClass('is-visible');
            $('.hamburger-trigger').removeClass('open');
            $('.sub-menu-two').slideUp('100');
            $('.lavel--3').slideUp('100');
            $('.responsive-manu > li > a').removeClass('is-visiable')
            $('.has-label--3 > a').removeClass('is-visiable')
    })
}
hamburgerOption();

function responsiveMenu() {
    $('.responsive-manu > li > a').on('click' , function (e) {
        e.preventDefault(),
        $(this).siblings('.sub-menu-two').slideToggle('400');
        $(this).toggleClass('is-visiable').siblings('.sub-menu-two').toggleClass('active');
        $('.lavel--3').slideUp('400');
        $('.has-label--3 > a').removeClass('is-visiable')
    });
    $('.has-label--3 > a').on('click',function (e) {
        e.preventDefault(),
        $(this).siblings('.lavel--3').slideToggle('400');
        $(this).toggleClass('is-visiable').siblings('.sub-menu-two').toggleClass('active');
    });
}
responsiveMenu();


/*--
    Header Mini Sidebar 
 -----------------------------------*/
$('.vertical-toggle-trigger').on('click' , function (e) {
    e.preventDefault(),
    $('.minisidebar__menu').toggleClass('is_visible');
    $(this).toggleClass('is_visible');
})

/*--
    Popup Menu 
 -----------------------------------*/
function popupHeader() {
    $('.popup-trigger').on('click' , function (e) {
        e.preventDefault(),
        $('.popup-fly-over-wrapper').addClass('is-visiable')
    })
    
    $('.close_btn').on('click' , function (e) {
        e.preventDefault(),
        $('.popup-fly-over-wrapper').removeClass('is-visiable');
        $('.drdropdown > a').removeClass('is-visiable');
        $('.drlabel2').slideUp('400');
    })
}
popupHeader();
/*--
    Golobal Click Menu 
 -----------------------------------*/

function dropDownMenu() {
    $('.drdropdown > a').on('click' , function (e) {
        e.preventDefault(),
        $(this).toggleClass('is-visiable').siblings('.drlabel2').slideToggle('400')
    })
}
dropDownMenu();
 
/*--
    mobile menu active          
 -----------------------------------*/
$("#mobile-menu-trigger").on('click', function(){
    $("#mobile-menu-overlay").addClass("active");
    $body.addClass('no-overflow');
});

$("#mobile-menu-close-trigger").on('click', function(){
    $("#mobile-menu-overlay").removeClass("active");
    $body.removeClass('no-overflow');
});
    
    

/*--
    offcanvas mobile menu           
-----------------------------------------------*/

var $offCanvasNav = $('.offcanvas-navigation'),
$offCanvasNavSubMenu = $offCanvasNav.find('.submenu2');

/*Add Toggle Button With Off Canvas Sub Menu*/
$offCanvasNavSubMenu.parent().prepend('<span class="menu-expand"><i></i></span>');

/*Close Off Canvas Sub Menu*/
$offCanvasNavSubMenu.slideUp();

/*Category Sub Menu Toggle*/
$offCanvasNav.on('click', 'li a, li .menu-expand', function(e) {
var $this = $(this);
if ( ($this.parent().attr('class').match(/\b(menu-item-has-children|has-children|has-sub-menu)\b/)) && ($this.attr('href') === '#' || $this.hasClass('menu-expand')) ) {
    e.preventDefault();
    if ($this.siblings('ul:visible').length){
        $this.parent('li').removeClass('active');
        $this.siblings('ul').slideUp();
    } else {
        $this.parent('li').addClass('active');
        $this.closest('li').siblings('li').removeClass('active').find('li').removeClass('active');
        $this.closest('li').siblings('li').find('ul:visible').slideUp();
        $this.siblings('ul').slideDown();
    }
}
});
/*--
    - Background Image
------------------------------------------*/
var $backgroundImage = $('.bg-image');
$backgroundImage.each(function() {
    var $this = $(this),
        $bgImage = $this.data('bg');
    $this.css('background-image', 'url('+$bgImage+')');
});
    
/*--
    Nice Select Active
---------------------------------*/
$('.nice-select').niceSelect();

/*--
    Sliders
-----------------------------------*/
// Projects Slider
$('.project-slider').slick({
    infinite: true,
    arrows: false,
    dots: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow: '<button class="slick-prev"><i class="fa fa-angle-left"></i></button>',
    nextArrow: '<button class="slick-next"><i class="fa fa-angle-right"></i></button>',
    responsive: [
        {
            breakpoint: 1501,
            settings: {
                slidesToShow: 3,
            }
        },
        {
            breakpoint: 1199,
            settings: {
                slidesToShow: 3,
            }
        },
        {
            breakpoint: 992,
            settings: {
                slidesToShow: 2,
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
            }
        },
        {
            breakpoint: 575,
            settings: {
                slidesToShow: 1,
            }
        },
    ]
});

/*--
Quick view Slick Carousel
-----------------------------------*/
$('.pro-dec-big-img-slider').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    draggable: false,
    fade: false,
    asNavFor: '.product-dec-slider',
});
    
/*--
    quick view Slick Carousel as Nav
-----------------------------------*/
$('.product-dec-slider').slick({
    slidesToShow: 5,
    slidesToScroll: 1,
    asNavFor: '.pro-dec-big-img-slider',
    arrows: false,
    dots: false,
    focusOnSelect:true,
    fade: false,
    prevArrow: '<span class="product-dec-icon-2 product-dec-prev"><i class="dlicon arrows-1_tail-left"></i></span>',
    nextArrow: '<span class="product-dec-icon-2 product-dec-next"><i class="dlicon arrows-1_tail-right"></i></span>',
    responsive: [
        {
            breakpoint: 767,
            settings: {
                
            }
        },
        {
            breakpoint: 420,
            settings: {
                adaptiveHeight: true,
                arrows: false,
                autoplay: true,
                slidesToShow: 3,
            }
        }
    ]
});

/*--
quick view Slick Carousel
-----------------------------------*/
$('.pro-dec-big-img-slider-2').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    draggable: false,
    fade: false,
    asNavFor: '.product-dec-slider-2',
});

/*--
    quick view Slick Carousel as Nav
-----------------------------------*/
$('.product-dec-slider-2').slick({
    slidesToShow: 4,
    slidesToScroll: 1,
    asNavFor: '.pro-dec-big-img-slider-2',
    arrows: false,
    dots: false,
    focusOnSelect:true,
    fade: false,
    vertical: true,
    prevArrow: '<span class="product-dec-icon-2 product-dec-prev"><i class="negan-icon-arrows-minimal-right"></i></span>',
    nextArrow: '<span class="product-dec-icon-2 product-dec-next"><i class="negan-icon-arrows-minimal-right"></i></span>',
    responsive: [
        {
            breakpoint: 1200,
            settings: {
                slidesToShow: 3,
            }
        },
        {
            breakpoint: 992,
            settings: {
                slidesToShow: 3,
            }
        },
        {
            breakpoint: 767,
            settings: {
                
            }
        },
        {
            breakpoint: 420,
            settings: {
                autoplay: true,
                slidesToShow: 3,
            }
        }
    ]
});

// Product Slider 4 (4 Column)
$('.related-product-slider').slick({
infinite: true,
arrows: false,
dots: true,
slidesToShow: 4,
slidesToScroll: 1,
prevArrow: '<button class="slick-prev"><i class="fa fa-angle-left"></i></button>',
nextArrow: '<button class="slick-next"><i class="fa fa-angle-right"></i></button>',
responsive: [
    {
        breakpoint: 1200,
        settings: {
            slidesToShow: 3,
            arrows: false,
        }
    },
    {
        breakpoint: 769,
        settings: {
            slidesToShow: 2,
            arrows: false,
        }
    },
    {
        breakpoint: 575,
        settings: {
            slidesToShow: 1,
            arrows: false,
        }
    }
]
});
// Testimonial Slider
$('.testimonial-slider').slick({
    infinite: true,
    arrows: false,
    fade: false,
    dots: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    prevArrow: '<button class="slick-prev"><i class="fa fa-chevron-left"></i></button>',
    nextArrow: '<button class="slick-next"><i class="fa fa-chevron-right"></i></button>'
});
$('.testimonial-slider-two').slick({
    infinite: true,
    arrows: false,
    fade: false,
    dots: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    prevArrow: '<button class="slick-prev"><i class="fa fa-chevron-left"></i></button>',
    nextArrow: '<button class="slick-next"><i class="fa fa-chevron-right"></i></button>'
});
// Testimonial Slider (Content)
$('.testimonial-slider-content').slick({
    infinite: true,
    arrows: false,
    fade: false,
    dots: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    asNavFor: '.testimonial-slider-image',
});
// Testimonial Slider (Image)
$('.testimonial-slider-image').slick({
    infinite: true,
    arrows: false,
    fade: false,
    dots: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    asNavFor: '.testimonial-slider-content',
    centerMode: true,
    centerPadding: '0px',
    focusOnSelect: true,
});
// Collection Slider
$('.collection-slider').slick({
    infinite: true,
    arrows: false,
    fade: false,
    dots: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    prevArrow: '<button class="slick-prev"><i class="fa fa-chevron-left"></i></button>',
    nextArrow: '<button class="slick-next"><i class="fa fa-chevron-right"></i></button>'
});

// Brand Slider
$('.brand-slider').slick({
    infinite: true,
    arrows: false,
    dots: false,
    slidesToShow: 6,
    slidesToScroll: 1,
    responsive: [
        {
            breakpoint: 1200,
            settings: {
                slidesToShow: 4,
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 3,
            }
        },
        {
            breakpoint: 479,
            settings: {
                slidesToShow: 2,
            }
        },
    ]
});
// Banner Slider
$('.banner-slider').slick({
    infinite: true,
    arrows: false,
    dots: true,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
        {
            breakpoint: 1200,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
            }
        },
        {
            breakpoint: 992,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
            }
        },
        {
            breakpoint: 481,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            }
        },
    ]
});
// Banner Slider
$('.cate-banner-slider').slick({
    infinite: true,
    arrows: true,
    dots: false,
    slidesToShow: 4,
    slidesToScroll: 4,
    prevArrow: '<button class="slick-prev"><i class="dlicon arrows-1_tail-triangle-left"></i></button>',
    nextArrow: '<button class="slick-next"><i class="dlicon arrows-1_tail-triangle-right"></i></button>',
    responsive: [
        {
            breakpoint: 1600,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
            }
        },
        {
            breakpoint: 992,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                autoplay: true,
                autoplaySpeed: 2000,
            }
        },
        {
            breakpoint: 481,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 2000,
            }
        },
    ]
});


// Blog Slider
$('.blog-slider').slick({
    infinite: true,
    arrows: true,
    dots: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: '<button class="slick-prev"><i class="dlicon arrows-1_tail-triangle-left"></i></button>',
    nextArrow: '<button class="slick-next"><i class="dlicon arrows-1_tail-triangle-right"></i></button>',
    adaptiveHeight: true
});
// POST Slider 4 (4 Column)
$('.related-post-slider').slick({
    infinite: true,
    arrows: false,
    dots: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow: '<button class="slick-prev"><i class="fa fa-angle-left"></i></button>',
    nextArrow: '<button class="slick-next"><i class="fa fa-angle-right"></i></button>',
    responsive: [
        {
            breakpoint: 1200,
            settings: {
                slidesToShow: 3,
                arrows: false,
            }
        },
        {
            breakpoint: 769,
            settings: {
                slidesToShow: 2,
                arrows: false,
            }
        },
        {
            breakpoint: 575,
            settings: {
                slidesToShow: 1,
                arrows: false,
            }
        }
    ]
    });


/*--
    Price slider
--------------------- */
var sliderrange = $('#slider-range');
var amountprice = $('#amount');
$(function() {
    sliderrange.slider({
        range: true,
        min: 16,
        max: 400,
        values: [0, 300],
        slide: function(event, ui) {
            amountprice.val("Price $" + ui.values[0] + " - $" + ui.values[1]);
        }
    });
    amountprice.val("Price $" + sliderrange.slider("values", 0) +
        " - $" + sliderrange.slider("values", 1));
});

/*------------------------
	Sticky Sidebar Active
-------------------------*/
$('#sticky-sidebar').theiaStickySidebar({
    // Settings
    additionalMarginTop: 0
  })

/*--
    onePageNav JS
---------------------------*/
$('.banner-nav ul, .sm-scroll').onePageNav({
    currentClass: 'active',
    changeHash: false,
    scrollSpeed: 750,
    scrollThreshold: 0.5,
    filter: '',
    easing: 'swing',
    offsetHeight: 80,
});  
/*---------------------------------
    28. Tilt Hover Animation
-----------------------------------*/
$('.paralax-image').tilt({
    max: 12,
    speed: 1e3,
    easing: "cubic-bezier(.03,.98,.52,.99)",
    transition: !1,
    perspective: 1e3,
    scale: 1
});  
/*--
    Magnific Popup
-----------------------------------*/
$('.img-popup').magnificPopup({
    type: 'image',
    gallery: {
        enabled: true,
    },
});
$('.gallery-popup').magnificPopup({
    type: 'image',
    gallery: {
        enabled: true,
    },
});
$('.video-popup').magnificPopup({
    type: 'iframe',
});
/*----------------------------------- 
    Count Down Active 
----------------------------------*/ 
$('[data-countdown]').each(function() {
	var $this = $(this), finalDate = $(this).data('countdown');
	$this.countdown(finalDate, function(event) {
		$this.html(event.strftime('<div class="countdown-wrap"><div class="day"><span class="number">%D</span><span class="text">days</span></div><div class="hour"><span class="number">%H</span><span class="text">hours</span></div><div class="minute"><span class="number">%M</span><span class="text">min</span></div><div class="second"><span class="number">%S</span><span class="text">sec</span></div></div>'));
	});
});
/*--------------------------
    Counter Up
---------------------------- */
$('.counter').counterUp({
    delay: 70,
    time: 5000
});
/*-----------------------
    Shop filter active 
------------------------- */
$('.filter-active a').on('click', function(e) {
    e.preventDefault();
    $('.product-filter-wrapper').slideToggle();
})
/* Cart dropdown */
var iconCart = $('.filter-active a');
iconCart.on('click', function() {
    $('.filter-active a').toggleClass('active');
})
/*----- 
	Quantity
--------------------------------*/
$(".quantity").append('<div class="dec qtybutton">-</div><div class="inc qtybutton">+</div>');

$(".qtybutton").on("click", function () {
    var $button = $(this);
    var oldValue = $button.parent().find("input").val();
    if ($button.hasClass("inc")) {
        var newVal = parseFloat(oldValue) + 1;
    } else {
        // Don't allow decrementing below zero
        if (oldValue > 1) {
            var newVal = parseFloat(oldValue) - 1;
        } else {
            newVal = 1;
        }
    }
    $button.parent().find("input").val(newVal);
});
/* ---
    checkout toggle function
* -------------------------------------------------------*/ 
$('.checkout-click3').on('click', function(e) {
    e.preventDefault();
    $('.checkout-login-info3').slideToggle(1000);
});
/*--
Create an account toggle
--------------------------*/
$('.checkout-toggle2').on('click', function() {
    $('.open-toggle2').slideToggle(1000);
});

$('.checkout-toggle').on('click', function() {
    $('.open-toggle').slideToggle(1000);
});

/*--
checkout one click toggle function
--------------------------*/
var checked = $( '.sin-payment input:checked' )
if(checked){
    $(checked).siblings( '.payment-box' ).slideDown(900);
};
    $( '.sin-payment input' ).on('change', function() {
    $( '.payment-box' ).slideUp(900);
    $(this).siblings( '.payment-box' ).slideToggle(900);
});

/*----- 
	Shipping Form Toggle
--------------------------------*/ 
$('[data-shipping]').on('click', function(){
    if( $('[data-shipping]:checked').length > 0 ) {
        $('#shipping-form').slideDown();
    } else {
        $('#shipping-form').slideUp();
    }
})
    
/*----- 
	Payment Method Select
--------------------------------*/
$('[name="payment-method"]').on('click', function(){
    
    var $value = $(this).attr('value');

    $('.single-method p').slideUp();
    $('[data-method="'+$value+'"]').slideDown();
    
})
/*--
instafeed
-----------------------------------*/

$('.instafeed').each(function() {
    var $this = $(this),
        $id = $this.find('ul').attr('id'),
        $limit = $this.data('limit'),
        $resolution = $this.data('resolution');
    if($this.length) {
        var feed = new Instafeed({
            get: 'user',
            userId: 6665768655,
            accessToken: '6665768655.1677ed0.313e6c96807c45d8900b4f680650dee5',
            target: $id,
            resolution: $resolution,
            limit: $limit,
            template: '<li><a href="{{link}}" target="_new"><img src="{{image}}" /></a><div class="item-info"><div class="inner"><a href="#"><i class="fa fa-comment-o"></i>0</a><a href="#"><i class="fa fa-heart-o"></i>01</a></div></div></li>',
        });
        feed.run();
    }
});
    
/*--
	MailChimp
-----------------------------------*/
$('#mc-form').ajaxChimp({
	language: 'en',
	callback: mailChimpResponse,
	// ADD YOUR MAILCHIMP URL BELOW HERE!
	url: 'http://devitems.us11.list-manage.com/subscribe/post?u=6bbb9b6f5827bd842d9640c82&amp;id=05d85f18ef'

});
function mailChimpResponse(resp) {
	
	if (resp.result === 'success') {
		$('.mailchimp-success').html('' + resp.msg).fadeIn(900);
		$('.mailchimp-error').fadeOut(400);
		
	} else if(resp.result === 'error') {
		$('.mailchimp-error').html('' + resp.msg).fadeIn(900);
	}  
}
/*--
    Portfolio Filter
-----------------------------------*/
$(window).load(function() {
    $('.masonry__wrap').imagesLoaded(function () {

        // filter items on button click
        $('.gallery__menu').on('click', 'button', function () {
            var filterValue = $(this).attr('data-filter');
            $(this).parents('li').siblings().find('button').removeClass('is-checked');
            $(this).addClass('is-checked');
            $grid.isotope({
                filter: filterValue
            });
        });

        // init Isotope
        var $grid = $('.masonry__wrap').isotope({
            percentPosition: true,
            transitionDuration: '0.7s',
            layoutMode: 'masonry',
            itemSelector: '.element-item',
            masonry: {
              columnWidth: '.resizer',
            }
        });

    });

})
/*----------------------------------
    WOW JS Active
-----------------------------------*/
new WOW().init();
/*----------------------------------
    ScrollUp Active
-----------------------------------*/
$.scrollUp({
    scrollText: '<i class="fa fa-angle-up"></i>',
    easingType: 'linear',
    scrollSpeed: 900,
    animation: 'fade'
});  



})(jQuery);	