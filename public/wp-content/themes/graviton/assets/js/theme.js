;(function ($) {

    "use strict";
    
    var pxl_scroll_top;
    var pxl_window_height;
    var pxl_window_width;
    var pxl_scroll_status = '';
    var pxl_last_scroll_top = 0;
    var pxl_post_slip = false;

    $(window).on('load', function () {
        setTimeout(function() {
            $(".pxl-loader").addClass("is-loaded");
        }, 60);
        $('.pxl-swiper-slider, .pxl-header-mobile-elementor').css('opacity', '1');
        $('.pxl-gallery-scroll').parents('body').addClass('body-overflow').addClass('body-visible-sm');
        pxl_window_width = $(window).width();
        pxl_window_height = $(window).height();
        graviton_header_sticky();
        graviton_header_mobile();
        graviton_scroll_to_top();
        graviton_footer_fixed();
        graviton_shop_quantity();
        graviton_submenu_responsive();
        graviton_panel_anchor_toggle();
        graviton_slider_column_offset();
        graviton_height_ct_grid();
        graviton_shop_view_layout();
        graviton_bgr_parallax();
        graviton_menu_divider_move();
        graviton_fit_to_screen();
    });

    $(window).on('scroll', function () {
        pxl_scroll_top = $(window).scrollTop();
        pxl_window_height = $(window).height();
        pxl_window_width = $(window).width();
        if (pxl_scroll_top < pxl_last_scroll_top) {
            pxl_scroll_status = 'up';
        } else {
            pxl_scroll_status = 'down';
        }
        pxl_last_scroll_top = pxl_scroll_top;
        graviton_header_sticky();
        graviton_scroll_to_top();
        graviton_footer_fixed();
        graviton_ptitle_scroll_opacity();
        graviton_post_slip();
        if (pxl_scroll_top < 100) {
            $('.elementor > .pin-spacer').removeClass('scroll-top-active');
        }
    });
    

    $(window).on('resize', function () {
        pxl_window_height = $(window).height();
        pxl_window_width = $(window).width();
        graviton_submenu_responsive();
        graviton_height_ct_grid();
        graviton_header_mobile();
        graviton_slider_column_offset();
        graviton_fit_to_screen();
        setTimeout(function() {
            graviton_menu_divider_move();
        }, 500);
    });

    $(document).ready(function () {
        graviton_post_slip();
        graviton_button_parallax();
        graviton_backtotop_progess_bar();
        graviton_type_file_upload();
        graviton_zoom_point();
        graviton_scroll_checkp_blog();

        
    /* Start Menu Mobile */
        $('.pxl-header-menu li.menu-item-has-children').append('<span class="pxl-menu-toggle"></span>');
        $('.pxl-menu-toggle').on('click', function () {
            if( $(this).hasClass('active')){
                $(this).closest('ul').find('.pxl-menu-toggle.active').toggleClass('active');
                $(this).closest('ul').find('.sub-menu.active').toggleClass('active').slideToggle();    
            }else{
                $(this).closest('ul').find('.pxl-menu-toggle.active').toggleClass('active');
                $(this).closest('ul').find('.sub-menu.active').toggleClass('active').slideToggle();
                $(this).toggleClass('active');
                $(this).parent().find('> .sub-menu').toggleClass('active');
                $(this).parent().find('> .sub-menu').slideToggle();
            }      
        });

        $("#pxl-nav-mobile, .pxl-anchor-mobile-menu").on('click', function () {
            $(this).toggleClass('active');
            $('body').toggleClass('body-overflow');
            $('.pxl-header-menu').toggleClass('active');
        });

        $(".pxl-menu-close, .pxl-header-menu-backdrop, #pxl-header-mobile .pxl-menu-primary a.is-one-page").on('click', function () {
            $(this).parents('.pxl-header-main').find('.pxl-header-menu').removeClass('active');
            $('#pxl-nav-mobile').removeClass('active');
            $('body').toggleClass('body-overflow');
        });
    /* End Menu Mobile */

    /* Menu Vertical */
        $('.pxl-nav-vertical li.menu-item-has-children > a').append('<span class="pxl-arrow-toggle"><i class="flaticon-right-up"></i></span>');
        $('.pxl-nav-vertical li.menu-item-has-children > a').on('click', function () {
            if( $(this).hasClass('active')){
                $(this).next().toggleClass('active').slideToggle(); 
            }else{
                $(this).closest('ul').find('.sub-menu.active').toggleClass('active').slideToggle();
                $(this).closest('ul').find('a.active').toggleClass('active');
                $(this).find('.pxl-menu-toggle.active').toggleClass('active');
                $(this).toggleClass('active');
                $(this).next().toggleClass('active').slideToggle();
            }   
        });

        $(".comments-area .btn-submit").append('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>');
    /* Mega Menu Max Height */
        var m_h_mega = $('li.pxl-megamenu > .sub-menu > .pxl-mega-menu-elementor').outerHeight();
        var w_h_mega = $(window).height();
        var w_h_mega_css = w_h_mega - 120;
        if(m_h_mega > w_h_mega) {
            $('li.pxl-megamenu > .sub-menu > .pxl-mega-menu-elementor').css('max-height', w_h_mega_css + 'px');
            $('li.pxl-megamenu > .sub-menu > .pxl-mega-menu-elementor').css('overflow-x', 'scroll');
        }
        // Active Mega Menu Hover
        $('li.pxl-megamenu').hover(function(){
            $(this).parents('.elementor-section').addClass('section-mega-active');
        },function(){
            $(this).parents('.elementor-section').removeClass('section-mega-active');
        });
    /* End Mega Menu Max Height */
    /* Search Popup */
        var $search_wrap_init = $("#pxl-search-popup");
        var search_field = $('#pxl-search-popup .search-field');
        var $body = $('body');

        $(".pxl-search-popup-button").on('click', function(e) {
            if (!$search_wrap_init.hasClass('active')) {
                $search_wrap_init.addClass('active');
                setTimeout(function() { search_field.get(0).focus(); }, 500);
            } else if (search_field.val() === '') {
                $search_wrap_init.removeClass('active');
                search_field.get(0).focus();
            }
            e.preventDefault();
            return false;
        });

        $(".pxl-subscribe-popup .pxl-item--overlay, .pxl-subscribe-popup .pxl-item--close").on('click', function (e) {
            $(this).parents('.pxl-subscribe-popup').removeClass('pxl-active');
            e.preventDefault();
            return false;
        });

        $("#pxl-search-popup .pxl-item--overlay, #pxl-search-popup .pxl-item--close").on('click', function (e) {
            $body.addClass('pxl-search-out-anim');
            setTimeout(function () {
                $body.removeClass('pxl-search-out-anim');
            }, 800);
            setTimeout(function () {
                $search_wrap_init.removeClass('active');
            }, 800);
            e.preventDefault();
            return false;
        });

    /* Scroll To Top */
        $('.pxl-scroll-top').click(function () {
            $('html, body').animate({scrollTop: 0}, 1200);
            $(this).parents('.pxl-wapper').find('.elementor > .pin-spacer').addClass('scroll-top-active');
            return false;
        });

    /* Animate Time Delay */
        $('.pxl-grid-masonry').each(function () {
            var eltime = 80;
            var elt_inner = $(this).children().length;
            var _elt = elt_inner - 1;
            $(this).find('> .pxl-grid-item > .wow').each(function (index, obj) {
                $(this).css('animation-delay', eltime + 'ms');
                if (_elt === index) {
                    eltime = 80;
                    _elt = _elt + elt_inner;
                } else {
                    eltime = eltime + 80;
                }
            });
        });

        $('.btn-text-nina').each(function () {
            var eltime = 0.045;
            var elt_inner = $(this).children().length;
            var _elt = elt_inner - 1;
            $(this).find('> .pxl--btn-text > span').each(function (index, obj) {
                $(this).css('transition-delay', eltime + 's');
                eltime = eltime + 0.045;
            });
        });

        $('.btn-text-nanuk').each(function () {
            var eltime = 0.05;
            var elt_inner = $(this).children().length;
            var _elt = elt_inner - 1;
            $(this).find('> .pxl--btn-text > span').each(function (index, obj) {
                $(this).css('animation-delay', eltime + 's');
                eltime = eltime + 0.05;
            });
        });

        $('.btn-text-smoke').each(function () {
            var eltime = 0.05;
            var elt_inner = $(this).children().length;
            var _elt = elt_inner - 1;
            $(this).find('> .pxl--btn-text > span > span > span').each(function (index, obj) {
                $(this).css('--d', eltime + 's');
                eltime = eltime + 0.05;
            });
        });

        $('.btn-text-reverse .pxl-text--front, .btn-text-reverse .pxl-text--back').each(function () {
            var eltime = 0.05;
            var elt_inner = $(this).children().length;
            var _elt = elt_inner - 1;
            $(this).find('.pxl-text--inner > span').each(function (index, obj) {
                $(this).css('transition-delay', eltime + 's');
                eltime = eltime + 0.05;
            });
        });
        
    /* End Animate Time Delay */

    /* Lightbox Popup */
        $('.pxl-action-popup').magnificPopup({
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false
        });

        $('.pxl-gallery-lightbox').each(function () {
            $(this).magnificPopup({
                delegate: 'a.lightbox',
                type: 'image',
                gallery: {
                    enabled: true
                },
                mainClass: 'mfp-fade',
            });
        });

    /* Page Title Parallax */
        if($('#pxl-page-title-default').hasClass('pxl--parallax')) {
            $(this).stellar();
        }

    /* Cart Sidebar Popup */
        $(".pxl-cart-sidebar-button").on('click', function () {
            $('body').addClass('body-overflow');
            $('#pxl-cart-sidebar').addClass('active');
        });
        $("#pxl-cart-sidebar .pxl-popup--overlay, #pxl-cart-sidebar .pxl-item--close").on('click', function () {
            $('body').removeClass('body-overflow');
            $('#pxl-cart-sidebar').removeClass('active');
        });

    /* Hover Active Item */
        $('.pxl--widget-hover').each(function () {
            $(this).hover(function () {
                $(this).parents('.elementor-row').find('.pxl--widget-hover').removeClass('pxl--item-active');
                $(this).parents('.elementor-container').find('.pxl--widget-hover').removeClass('pxl--item-active');
                $(this).addClass('pxl--item-active');
            });
        });

        /* Click Active Item */
        $('.pxl--widget-click').each(function () {
            $(this).on('click', function () {
                $(this).parents('.elementor-row').find('.pxl--widget-click').removeClass('pxl--item-active');
                $(this).parents('.elementor-container').find('.pxl--widget-click').removeClass('pxl--item-active');
                $(this).parents('.elementor-container').find('.pxl--widget-click').removeClass('show-content');
                $(this).addClass('pxl--item-active');
            });
        });

    /* Start Icon Bounce */
        var boxEls = $('.el-bounce, .pxl-image-effect1, .el-effect-zigzag');
        $.each(boxEls, function(boxIndex, boxEl) {
            loopToggleClass(boxEl, 'active');
        });

        function loopToggleClass(el, toggleClass) {
            el = $(el);
            let counter = 0;
            if (el.hasClass(toggleClass)) {
                waitFor(function () {
                    counter++;
                    return counter == 2;
                }, function () {
                    counter = 0;
                    el.removeClass(toggleClass);
                    loopToggleClass(el, toggleClass);
                }, 'Deactivate', 1000);
            } else {
                waitFor(function () {
                    counter++;
                    return counter == 3;
                }, function () {
                    counter = 0;
                    el.addClass(toggleClass);
                    loopToggleClass(el, toggleClass);
                }, 'Activate', 1000);
            }
        }

        function waitFor(condition, callback, message, time) {
            if (message == null || message == '' || typeof message == 'undefined') {
                message = 'Timeout';
            }
            if (time == null || time == '' || typeof time == 'undefined') {
                time = 100;
            }
            var cond = condition();
            if (cond) {
                callback();
            } else {
                setTimeout(function() {
                    waitFor(condition, callback, message, time);
                }, time);
            }
        }
    /* End Icon Bounce */

    /* Image Effect */
        if($('.pxl-image-tilt').length){
            $('.pxl-image-tilt').parents('.elementor-top-section').addClass('pxl-image-tilt-active');
            $('.pxl-image-tilt').each(function () {
                var pxl_maxtilt = $(this).data('maxtilt'),
                pxl_speedtilt = $(this).data('speedtilt'),
                pxl_perspectivetilt = $(this).data('perspectivetilt');
                VanillaTilt.init(this, {
                    max: pxl_maxtilt,
                    speed: pxl_speedtilt,
                    perspective: pxl_perspectivetilt
                });
            });
        }

    /* Select Theme Style */
        $('.wpcf7-select').each(function(){
            var $this = $(this), numberOfOptions = $(this).children('option').length;

            $this.addClass('pxl-select-hidden'); 
            $this.wrap('<div class="pxl-select"></div>');
            $this.after('<div class="pxl-select-higthlight"></div>');

            var $styledSelect = $this.next('div.pxl-select-higthlight');
            $styledSelect.text($this.children('option').eq(0).text());

            var $list = $('<ul />', {
                'class': 'pxl-select-options'
            }).insertAfter($styledSelect);

            for (var i = 0; i < numberOfOptions; i++) {
                $('<li />', {
                    text: $this.children('option').eq(i).text(),
                    rel: $this.children('option').eq(i).val()
                }).appendTo($list);
            }

            var $listItems = $list.children('li');

            $styledSelect.click(function(e) {
                e.stopPropagation();
                $('div.pxl-select-higthlight.active').not(this).each(function(){
                    $(this).removeClass('active').next('ul.pxl-select-options').addClass('pxl-select-lists-hide');
                });
                $(this).toggleClass('active');
            });

            $listItems.click(function(e) {
                e.stopPropagation();
                $styledSelect.text($(this).text()).removeClass('active');
                $this.val($(this).attr('rel'));
            });

            $(document).click(function() {
                $styledSelect.removeClass('active');
            });

        });

    /* Nice Select */
        $('.woocommerce-ordering .orderby, #pxl-sidebar-area select, .variations_form.cart .variations select, .pxl-open-table select, .pxl-nice-select').each(function () {
            $(this).niceSelect();
        });

    /* Typewriter */
        if($('.pxl-title--typewriter').length) {
            function typewriterOut(elements, callback)
            {
                if (elements.length){
                    elements.eq(0).addClass('is-active');
                    elements.eq(0).delay( 3000 );
                    elements.eq(0).removeClass('is-active');
                    typewriterOut(elements.slice(1), callback);
                }
                else {
                    callback();
                }
            }

            function typewriterIn(elements, callback)
            {
                if (elements.length){
                    elements.eq(0).addClass('is-active');
                    elements.eq(0).delay( 3000 ).slideDown(3000, function(){
                        elements.eq(0).removeClass('is-active');
                        typewriterIn(elements.slice(1), callback);
                    });
                }
                else {
                    callback();
                }
            }

            function typewriterInfinite(){
                typewriterOut($('.pxl-title--typewriter .pxl-item--text'), function(){ 
                    typewriterIn($('.pxl-title--typewriter .pxl-item--text'), function(){
                        typewriterInfinite();
                    });
                });
            }
            $(function(){
                typewriterInfinite();
            });
        }
    /* End Typewriter */

    /* Section Particles */      
        setTimeout(function() {
            $(".pxl-row-particles").each(function() {
                particlesJS($(this).attr('id'), {
                  "particles": {
                    "number": {
                        "value": $(this).data('number'),
                    },
                    "color": {
                        "value": $(this).data('color')
                    },
                    "shape": {
                        "type": "circle",
                    },
                    "size": {
                        "value": $(this).data('size'),
                        "random": $(this).data('size-random'),
                    },
                    "line_linked": {
                        "enable": false,
                    },
                    "move": {
                        "enable": true,
                        "speed": 2,
                        "direction": $(this).data('move-direction'),
                        "random": true,
                        "out_mode": "out",
                    }
                },
                "retina_detect": true
            });
            });
        }, 400);



    /* Get checked input - Mailchimpp */
        $('.mc4wp-form input:checkbox').change(function(){
            if($(this).is(":checked")) {
                $('.mc4wp-form').addClass("pxl-input-checked");
            } else {
                $('.mc4wp-form').removeClass("pxl-input-checked");
            }
        });

    /* Scroll to content */
        $('.pxl-link-to-section .btn').on('click', function(e) {
            var id_scroll = $(this).attr('href');
            var offsetScroll = $('.pxl-header-elementor-sticky').outerHeight();
            e.preventDefault();
            $("html, body").animate({ scrollTop: $(id_scroll).offset().top - offsetScroll }, 600);
        });

        // Hover Item Active
        $( ".pxl-post-modern1 .pxl-post--content .pxl-post--item" )
        .on( "mouseenter", function() {
            $(this).addClass("active");          
            $(".pxl-post-modern1 .pxl-post--images .pxl-post--featured").removeClass('active');       
            var selected_item = $(this).find(".pxl-content--inner").attr("data-image");
            $(selected_item).addClass('active').removeClass('non-active');
        } )
        .on( "mouseleave", function() {
            $(".pxl-post-modern1 .pxl-post--content .pxl-post--item").removeClass('active');
            $(".pxl-post-modern1 .pxl-post--images .pxl-post--featured").removeClass('non-active');
            var selected_item = $(this).find(".pxl-content--inner").attr("data-image");
            $(selected_item).removeClass('active').addClass('non-active');
        } 
        );

        // Hover Overlay Effect
        $('.pxl-overlay-shake').mousemove(function(event){ 
            var offset = $(this).offset();
            var W = $(this).outerWidth();
            var X = (event.pageX - offset.left);
            var Y = (event.pageY - offset.top);
            $(this).find('.pxl-overlay--color').css({
                'top' : + Y + 'px',
                'left' : + X + 'px'
            });
        });

        //Some Widget Default
        $('.widget .cat-item a, .widget_archive li a').append('<span class="pxl-item--divider"></span>');

    /* Social Button Click */
        $('.pxl-social--button').on('click', function () {
            $(this).toggleClass('active');
        });
        $(document).on('click', function (e) {
            if (e.target.className == 'pxl-social--button active')
                $('.pxl-social--button').removeClass('active');
        });

        // Header Home 2
        $('#home-2-header').append('<span class="pxl-header-divider1"></span><span class="pxl-header-divider2"></span><span class="pxl-header-divider3"></span><span class="pxl-header-divider4"></span>');
        $('#home-2-header-sticky').append('<span class="pxl-header-divider2"></span><span class="pxl-header-divider4"></span>');

    });

jQuery(document).ajaxComplete(function(event, xhr, settings){
    graviton_shop_quantity();
});

jQuery( document ).on( 'updated_wc_div', function() {
    graviton_shop_quantity();
} );

/* Header Sticky */
function graviton_header_sticky() {
    if($('#pxl-header-elementor').hasClass('is-sticky')) {
        if (pxl_scroll_top > 100) {
            $('.pxl-header-elementor-sticky.pxl-sticky-stb').addClass('pxl-header-fixed');
            $('#pxl-header-mobile').addClass('pxl-header-mobile-fixed');
        } else {
            $('.pxl-header-elementor-sticky.pxl-sticky-stb').removeClass('pxl-header-fixed');
            $('#pxl-header-mobile').removeClass('pxl-header-mobile-fixed');
        }

        if (pxl_scroll_status == 'up' && pxl_scroll_top > 100) {
            $('.pxl-header-elementor-sticky.pxl-sticky-stt').addClass('pxl-header-fixed');
        } else {
            $('.pxl-header-elementor-sticky.pxl-sticky-stt').removeClass('pxl-header-fixed');
        }
    }

    $('.pxl-header-elementor-sticky').parents('body').addClass('pxl-header-sticky');
}

/* Header Mobile */
function graviton_header_mobile() {
    var h_header_mobile = $('#pxl-header-elementor').outerHeight();
    if(pxl_window_width < 1199) {
        $('#pxl-header-elementor').css('min-height', h_header_mobile + 'px');
    }
}

/* Scroll To Top */
function graviton_scroll_to_top() {
    if (pxl_scroll_top < pxl_window_height) {
        $('.pxl-scroll-top').addClass('pxl-off').removeClass('pxl-on');
    }
    if (pxl_scroll_top > pxl_window_height) {
        $('.pxl-scroll-top').addClass('pxl-on').removeClass('pxl-off');
    }
}

/* Footer Fixed */
function graviton_footer_fixed() {
    setTimeout(function(){
        var h_footer = $('.pxl-footer-fixed #pxl-footer-elementor').outerHeight() - 1;
        $('.pxl-footer-fixed #pxl-main').css('margin-bottom', h_footer + 'px');
    }, 600);
}

/* WooComerce Quantity */
function graviton_shop_quantity() {
    "use strict";
    $('#pxl-wapper .quantity').append('<span class="quantity-icon quantity-down pxl-icon--minus"></span><span class="quantity-icon quantity-up pxl-icon--plus"></span>');
    $('.quantity-up').on('click', function () {
        $(this).parents('.quantity').find('input[type="number"]').get(0).stepUp();
        $(this).parents('.woocommerce-cart-form').find('.actions .button').removeAttr('disabled');
    });
    $('.quantity-down').on('click', function () {
        $(this).parents('.quantity').find('input[type="number"]').get(0).stepDown();
        $(this).parents('.woocommerce-cart-form').find('.actions .button').removeAttr('disabled');
    });
    $('.quantity-icon').on('click', function () {
        var quantity_number = $(this).parents('.quantity').find('input[type="number"]').val();
        var add_to_cart_button = $(this).parents( ".product, .woocommerce-product-inner" ).find(".add_to_cart_button");
        add_to_cart_button.attr('data-quantity', quantity_number);
        add_to_cart_button.attr("href", "?add-to-cart=" + add_to_cart_button.attr("data-product_id") + "&quantity=" + quantity_number);
    });
    $('.woocommerce-cart-form .actions .button').removeAttr('disabled');
}

/* Menu Responsive Dropdown */
function graviton_submenu_responsive() {
    var $graviton_menu = $('.pxl-header-elementor-main, .pxl-header-elementor-sticky');
    $graviton_menu.find('.pxl-menu-primary li').each(function () {
        var $graviton_submenu = $(this).find('> ul.sub-menu');
        if ($graviton_submenu.length == 1) {
            if ( ($graviton_submenu.offset().left + $graviton_submenu.width() + 0 ) > $(window).width()) {
                $graviton_submenu.addClass('pxl-sub-reverse');
            }
        }
    });
}

function graviton_panel_anchor_toggle(){
    'use strict';
    $(document).on('click','.pxl-anchor-button',function(e){
        e.preventDefault();
        e.stopPropagation();
        var target = $(this).attr('data-target');
        $(target).toggleClass('active');
        $('body').addClass('body-overflow');
        $('.pxl-popup--conent .wow').addClass('animated').removeClass('aniOut');
        $('.pxl-popup--conent .fadeInPopup').removeClass('aniOut');
        if($(target).find('.pxl-search-form').length > 0){
            setTimeout(function(){
                $(target).find('.pxl-search-form .pxl-search-field').focus();
            },1000);
        }
    });


    $(document).on('click','.pxl-button.pxl-atc-popup > .btn',function(e){
        e.preventDefault();
        e.stopPropagation();
        var target = $(this).attr('data-target');
        $(target).toggleClass('active');
        $('body').addClass('body-overflow');
    });

    $('.pxl-anchor-button').each(function () {
        var t_target = $(this).attr('data-target');
        var t_delay = $(this).attr('data-delay-hover');
        $(t_target).find('.pxl-popup--conent').css('transition-delay', t_delay + 'ms');
        $(t_target).find('.pxl-popup--overlay').css('transition-delay', t_delay + 'ms');
    });

    $(".pxl-hidden-panel-popup .pxl-popup--overlay, .pxl-hidden-panel-popup .pxl-close-popup").on('click', function () {
        $('body').removeClass('body-overflow');
        $('.pxl-hidden-panel-popup').removeClass('active');
        $('.pxl-popup--conent .wow').addClass('aniOut').removeClass('animated');
        $('.pxl-popup--conent .fadeInPopup').addClass('aniOut');
    });

    // $(".pxl-button.pxl-atc-popup").on('click', function () {
    //     $('body').addClass('body-overflow');
    //     $(this).parents('.pxl-wapper').find('.pxl-page-popup').addClass('active');
    // });
    $(".pxl-popup--close").on('click', function () {
        $('body').removeClass('body-overflow');
        $(this).parent().removeClass('active');
    });
    $(".pxl-close-popup").on('click', function () {
        $('body').removeClass('body-overflow');
        $('.pxl-page-popup').removeClass('active');
    });
}

/* Page Title Scroll Opacity */
function graviton_ptitle_scroll_opacity() {
    var divs = $('#pxl-page-title-elementor.pxl-scroll-opacity .elementor-widget'),
    limit = $('#pxl-page-title-elementor.pxl-scroll-opacity').outerHeight();
    if (pxl_scroll_top <= limit) {
        divs.css({ 'opacity' : (1 - pxl_scroll_top/limit)});
    }
}

/* Slider Column Offset */
function graviton_slider_column_offset() {
    var content_w = ($('#pxl-main').width() - 1200) / 2;
    if (pxl_window_width > 1200) {
        $('.pxl-slider2 .pxl-item--left').css('padding-left', content_w + 'px');
    }
}

/* Preloader Default */
$.fn.extend({
    jQueryImagesLoaded: function () {
      var $imgs = this.find('img[src!=""]')

      if (!$imgs.length) {
        return $.Deferred()
        .resolve()
        .promise()
    }

    var dfds = []

    $imgs.each(function () {
        var dfd = $.Deferred()
        dfds.push(dfd)
        var img = new Image()
        img.onload = function () {
          dfd.resolve()
      }
      img.onerror = function () {
          dfd.resolve()
      }
      img.src = this.src
  })

    return $.when.apply($, dfds)
}
})

/* Post Slip */
function graviton_post_slip() {
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;
    var scrollTop = $(window).scrollTop();

    jQuery('.pxl-post-image--track').each(function () {
        var topLimit = parseFloat(jQuery('.pxl-post-image--block').first().css('top'));
        var bottomLimit = parseFloat(jQuery('.pxl-post-image--block').first().outerHeight())
        + parseFloat(jQuery('.pxl-post-block_2').css('margin-top'));

        jQuery('.pxl-post-image--block').removeClass('end').each(function (is) {
            var currentTop = jQuery(this).offset().top - scrollTop - topLimit;

            var c = parseFloat(currentTop / bottomLimit);
            if (c < 0) c = 0;
            else if (c > 1) c = 1;

            if (c == 0 || is == 0){
                jQuery(this).addClass('active');

                jQuery('#pxl-post-active-link').attr( 'data-service_title', jQuery.trim( jQuery(this).find('.pxl-post-block--min h3').html().replace(/[\r\n\t]|\<[^\>]+\>/g, '') ) );
            } else jQuery(this).removeClass('active');

            if (c < .5 || is == 0) jQuery(this).addClass('preactive');
            else jQuery(this).removeClass('preactive');
        });

        jQuery('.pxl-post-image--block.preactive').slice(0, -1).removeClass('active').addClass('end');

    });
    if ($('.pxl-post-slip').length) {
        var offsetTop = $('.pxl-post-slip').offset().top + (windowWidth >= 1200 ? 500 : 100) - windowHeight;
        if ((scrollTop >= offsetTop) && !pxl_post_slip) {
            $(".pxl-post-block_1").addClass("slip-active");
            setTimeout(function () {
                $(".pxl-post-block_2").addClass("slip-active");
            }, 500);
            setTimeout(function () {
                $(".pxl-post-block_3").addClass("slip-active");
            }, 600);
            setTimeout(function () {
                $(".pxl-post-block_4").addClass("slip-active");
            }, 700);
            setTimeout(function () {
                $(".pxl-post-block_5").addClass("slip-active");
            }, 800);
            setTimeout(function () {
                $(".pxl-post-block_6").addClass("slip-active");
            }, 900);
            setTimeout(function () {
                $(".pxl-post-block_7").addClass("slip-active");
            }, 1000);
            setTimeout(function () {
                $(".pxl-post-block_8").addClass("slip-active");
            }, 1100);
            setTimeout(function () {
                $(".pxl-post-block_9").addClass("slip-active");
            }, 1200);
            setTimeout(function () {
                $(".pxl-post-block_10").addClass("slip-active");
            }, 1300);
            setTimeout(function () {
                $(".pxl-post-block_11").addClass("slip-active");
            }, 1400);
            setTimeout(function () {
                $(".pxl-post-block_12").addClass("slip-active");
            }, 1500);
            setTimeout(function () {
                $(".pxl-post-block_13").addClass("slip-active");
            }, 1600);
            setTimeout(function () {
                $(".pxl-post-block_14").addClass("slip-active");
            }, 1700);
            setTimeout(function () {
                $(".pxl-post-block_15").addClass("slip-active");
            }, 1800);
            setTimeout(function () {
                $(".pxl-post-block_16").addClass("slip-active");
            }, 1900);
            setTimeout(function () {
                $(".pxl-post-block_17").addClass("slip-active");
            }, 2000);
            setTimeout(function () {
                $(".pxl-post-block_18").addClass("slip-active");
            }, 2100);
            setTimeout(function () {
                $(".pxl-post-block_19").addClass("slip-active");
            }, 2200);
            setTimeout(function () {
                $(".pxl-post-block_20").addClass("slip-active");
            }, 2300);

            pxl_post_slip = true;
        }
    }
}

/* Button Parallax */
function graviton_button_parallax() {
    $('.btn-text-parallax, .pxl-blog-style2, .pxl-hover-parallax').on('mouseenter', function() {
        $(this).addClass('hovered');
    });

    $('.btn-text-parallax, .pxl-blog-style2, .pxl-hover-parallax').on('mouseleave', function() { 
        $(this).removeClass('hovered');
    });

    $('.btn-text-parallax').on('mousemove', function(e) {
        const bounds = this.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height;
        const deltaX = Math.floor((centerX - e.clientX)) * 0.222;
        const deltaY = Math.floor((centerY - e.clientY)) * 0.333;
        $(this).find('.pxl--btn-text').css({
            transform: 'translate3d('+ deltaX * 0.32 +'px, '+ deltaY * 0.32 +'px, 0px)'
        });
    });

    $('.pxl-blog-style2 .pxl-post--featured, .pxl-hover-parallax').on('mousemove', function(e) {
        const bounds = this.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height;
        const deltaX = Math.floor((centerX - e.clientX)) * 0.222;
        const deltaY = Math.floor((centerY - e.clientY)) * 0.333;
        $(this).find('.pxl-item-parallax, .pxl-post--button').css({
            transform: 'translate3d('+ deltaX * 0.32 +'px, '+ deltaY * 0.32 +'px, 0px)'
        });
    });
}

/* Menu Divider Move */
function graviton_menu_divider_move() {
    $('.pxl-nav-menu1.fr-style-box, .pxl-nav-menu1.fr-style-box2').each(function () {
        var current = $(this).find('.pxl-menu-primary > .current-menu-item, .pxl-menu-primary > .current-menu-parent, .pxl-menu-primary > .current-menu-ancestor');
        if(current.length > 0) {
            var marker = $(this).find('.pxl-divider-move');
            marker.css({
                left: current.position().left,
                width: current.outerWidth(),
                display: "block"
            });
            marker.addClass('active');
            current.addClass('pxl-shape-active');
            if (Modernizr.csstransitions) {
                $(this).find('.pxl-menu-primary > li').mouseover(function () {
                    var self = $(this),
                    offsetLeft = self.position().left,
                    width = self.outerWidth() || current.outerWidth(),
                    left = offsetLeft == 0 ? 0 : offsetLeft || current.position().left;
                    marker.css({
                        left: left,
                        width: width,
                    });
                    marker.addClass('active');
                    current.removeClass('pxl-shape-active');
                });
                $(this).find('.pxl-menu-primary').mouseleave(function () {
                    marker.css({
                        left: current.position().left,
                        width: current.outerWidth()
                    });
                    current.addClass('pxl-shape-active');
                });
            }
        } else {
            var marker = $(this).find('.pxl-divider-move');
            var current = $(this).find('.pxl-menu-primary > li:nth-child(1)');
            marker.css({
                left: current.position().left,
                width: current.outerWidth(),
                display: "block"
            });
            if (Modernizr.csstransitions) {
                $(this).find('.pxl-menu-primary > li').mouseover(function () {
                    var self = $(this),
                    offsetLeft = self.position().left,
                    width = self.outerWidth() || current.outerWidth(),
                    left = offsetLeft == 0 ? 0 : offsetLeft || current.position().left;
                    marker.css({
                        left: left,
                        width: width,
                    });
                    marker.addClass('active');
                });
                $(this).find('.pxl-menu-primary').mouseleave(function () {
                    marker.css({
                        left: current.position().left,
                        width: current.outerWidth()
                    });
                    marker.removeClass('active');
                });
            }
        }
    });
}

/* Back To Top Progress Bar */
function graviton_backtotop_progess_bar() {
    if($('.pxl-scroll-top').length > 0){
        var progressPath = document.querySelector('.pxl-scroll-top path');
        var pathLength = progressPath.getTotalLength();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
        progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
        progressPath.style.strokeDashoffset = pathLength;
        progressPath.getBoundingClientRect();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';      
        var updateProgress = function () {
            var scroll = $(window).scrollTop();
            var height = $(document).height() - $(window).height();
            var progress = pathLength - (scroll * pathLength / height);
            progressPath.style.strokeDashoffset = progress;
        }
        updateProgress();
        $(window).scroll(updateProgress);   
        var offset = 50;
        var duration = 550;
        $(window).on('scroll', function() {
            if ($(this).scrollTop() > offset) {
                $('.pxl-scroll-top').addClass('active-progress');
            } else {
                $('.pxl-scroll-top').removeClass('active-progress');
            }
        });
    }
}

/* Custom Type File Upload*/
function graviton_type_file_upload() {

    var multipleSupport = typeof $('<input/>')[0].multiple !== 'undefined',
    isIE = /msie/i.test( navigator.userAgent );

    $.fn.pxl_custom_type_file = function() {

        return this.each(function() {

            var $file = $(this).addClass('pxl-file-upload-hidden'),
            $wrap = $('<div class="pxl-file-upload-wrapper">'),
            $button = $('<button type="button" class="pxl-file-upload-button">Choose File</button>'),
            $input = $('<input type="text" class="pxl-file-upload-input" placeholder="No File Choose" />'),
            $label = $('<label class="pxl-file-upload-button" for="'+ $file[0].id +'">Choose File</label>');
            $file.css({
                position: 'absolute',
                opacity: '0',
                visibility: 'hidden'
            });

            $wrap.insertAfter( $file )
            .append( $file, $input, ( isIE ? $label : $button ) );

            $file.attr('tabIndex', -1);
            $button.attr('tabIndex', -1);

            $button.click(function () {
                $file.focus().click();
            });

            $file.change(function() {

                var files = [], fileArr, filename;

                if ( multipleSupport ) {
                    fileArr = $file[0].files;
                    for ( var i = 0, len = fileArr.length; i < len; i++ ) {
                        files.push( fileArr[i].name );
                    }
                    filename = files.join(', ');
                } else {
                    filename = $file.val().split('\\').pop();
                }

                $input.val( filename )
                .attr('title', filename)
                .focus();
            });

            $input.on({
                blur: function() { $file.trigger('blur'); },
                keydown: function( e ) {
                    if ( e.which === 13 ) {
                        if ( !isIE ) { 
                            $file.trigger('click'); 
                        }
                    } else if ( e.which === 8 || e.which === 46 ) {
                        $file.replaceWith( $file = $file.clone( true ) );
                        $file.trigger('change');
                        $input.val('');
                    } else if ( e.which === 9 ){
                        return;
                    } else {
                        return false;
                    }
                }
            });

        });

    };
    $('.wpcf7-file[type=file]').pxl_custom_type_file();
}
//divider blog
function graviton_scroll_checkp_blog($scope){
    $('.blog .pxl-el-divider,.archive .pxl-el-divider,.tags .pxl-el-divider,.single .pxl-el-divider,.pxl-image-hover').each(function () {
        var wcont1 = $(this);


        function checkScrollPosition() {
            var pxl_scroll_top = $(window).scrollTop(),
            viewportBottom = pxl_scroll_top + $(window).height(),
            elementTop = wcont1.offset().top,
            elementBottom = elementTop + wcont1.outerHeight();

            if (elementTop < viewportBottom && elementBottom > pxl_scroll_top) {
                wcont1.addClass('visible');
            }
        }

        checkScrollPosition();

        $(window).on('scroll', function () {
            checkScrollPosition();
        });

    });

    $('.ic-scroll').each(function () {
        var wcont1 = $(this);


        function checkScrollPosition() {
            var pxl_scroll_top = $(window).scrollTop(),
            viewportBottom = pxl_scroll_top + $(window).height(),
            elementTop = wcont1.offset().top,
            elementBottom = elementTop + wcont1.outerHeight();

            if (elementTop < viewportBottom && elementBottom > pxl_scroll_top) {
                wcont1.addClass('visible');
            }
        }

        checkScrollPosition();

        $(window).on('scroll', function () {
            checkScrollPosition();
        });

    });
}
function graviton_bgr_parallax() {
    setTimeout(function(){
        jarallax(document.querySelectorAll('.pxl-section-bg-parallax'), {
            speed: 0.2,
        });
    }, 300);
}
 //Shop View Grid/List
function graviton_shop_view_layout(){

    $(document).on('click','.pxl-view-layout .view-icon a', function(e){
        e.preventDefault();
        if(!$(this).parent('li').hasClass('active')){
            $('.pxl-view-layout .view-icon').removeClass('active');
            $(this).parent('li').addClass('active');
            $(this).parents('.pxl-content-area').find('ul.products').removeAttr('class').addClass($(this).attr('data-cls'));
        }
    });
}

function graviton_height_ct_grid($scope){
    $('.pxl-portfolio-grid-layout1 .pxl-grid-item').each(function () {
        var elementHeight = $(this).find(".pxl-post--content").height();
        $(this).find(".pxl-post--content").css("margin-bottom",  "-"+elementHeight + "px");     
    });
}
    // Zoom Point
function graviton_zoom_point() {
    $(".pxl-zoom-point").each(function () {

        let scaleOffset = $(this).data('offset');
        let scaleAmount = $(this).data('scale-mount');

        function scrollZoom() {
            const images = document.querySelectorAll("[data-scroll-zoom]");
            let scrollPosY = 0;
            scaleAmount = scaleAmount / 100;

            const observerConfig = {
                rootMargin: "0% 0% 0% 0%",
                threshold: 0
            };

            images.forEach(image => {
                let isVisible = false;
                const observer = new IntersectionObserver((elements, self) => {
                    elements.forEach(element => {
                        isVisible = element.isIntersecting;
                    });
                }, observerConfig);

                observer.observe(image);

                image.style.transform = `scale(${1 + scaleAmount * percentageSeen(image)})`;

                window.addEventListener("scroll", () => {
                    if (isVisible) {
                        scrollPosY = window.pageYOffset;
                        image.style.transform = `scale(${1 +
                        scaleAmount * percentageSeen(image)})`;
                    }
                });
            });

            function percentageSeen(element) {
                const parent = element.parentNode;
                const viewportHeight = window.innerHeight;
                const scrollY = window.scrollY;
                const elPosY = parent.getBoundingClientRect().top + scrollY + scaleOffset;
                const borderHeight = parseFloat(getComputedStyle(parent).getPropertyValue('border-bottom-width')) + parseFloat(getComputedStyle(element).getPropertyValue('border-top-width'));
                const elHeight = parent.offsetHeight + borderHeight;

                if (elPosY > scrollY + viewportHeight) {
                    return 0;
                } else if (elPosY + elHeight < scrollY) {
                    return 100;
                } else {
                    const distance = scrollY + viewportHeight - elPosY;
                    let percentage = distance / ((viewportHeight + elHeight) / 100);
                    percentage = Math.round(percentage);

                    return percentage;
                }
            }
        }

        scrollZoom();

    });
}

    // Fit to Screen
function graviton_fit_to_screen() {
    $('.pxl-gallery-scroll.h-fit-to-screen').each(function () {
        var h_adminbar = 0;
        var h_section_header = 0;
        var h_section_footer = 0;
        if ($('#wpadminbar').length == 1) {
            h_adminbar = $('#wpadminbar').outerHeight();
        }
        if ($('#pxl-header-elementor').length == 1) {
            h_section_header = $('#pxl-header-elementor').outerHeight();
        }
        if ($('#pxl-footer-elementor').length == 1) {
            h_section_footer = $('#pxl-footer-elementor').outerHeight();
        }
        var h_total = pxl_window_height - (h_adminbar + h_section_header + h_section_footer);
        $(this).css('height', h_total + 'px');
    });
}



$(document).ready(function() {
    setTimeout(function() {
        function isElementInViewport(el) {
            var rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
        }
        $(window).on('scroll resize', function() {
            $('.pxl-image-properties .dot').each(function() {
                if (isElementInViewport(this)) {
                    $(this).addClass('active');
                }else {
                    $(this).removeClass('active');
                }

            });
        });

        $(window).trigger('scroll');
    }, 1000);
});

$(document).on('click', function(event) {
    var clickedElement = $(event.target);
    var divWithClass = $('.pxl--item.pxl--item-active');

    // Kiểm tra xem phần tử được click có class là 'pxl--item' và 'pxl--item-active' hay không
    if (clickedElement.hasClass('pxl--item') && clickedElement.hasClass('pxl--item-active')) {
        // Không làm gì nếu click vào phần tử chính
        return;
    }

    // Kiểm tra xem phần tử được click có nằm trong div có class là 'pxl--item pxl--item-active' hay không
    var isClickInsideDiv = divWithClass.has(clickedElement).length > 0;

    // Nếu click bên ngoài div có class là 'pxl--item pxl--item-active', xóa class 'pxl--item-active'
    if (!isClickInsideDiv) {
        divWithClass.removeClass('pxl--item-active');
    }
});


})(jQuery);
