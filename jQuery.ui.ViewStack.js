(function ($) {
    $.widget("NerdyDudeDesigns.ViewStack", {
        options: {
            duration: 200,
            showControls: false,
            orientation: 'horizontal',
            leftOffset: 0,
            flushToTop: undefined,
            flushToLeft: undefined,
            history: false,
            stateCallback: $.noop,
            complete: $.noop,
            beginTransition: $.noop
        },

        _init: function () {
        },

        // Set up the widget
        _create: function () {
            this.element
            	.addClass('ui-stack')
            	.css({ position: 'relative' });

            this.inner =
                $('<div>')
                	.addClass('ui-stack-inner');
                    
            this.element
			    .children()
			    .addClass('ui-stack-view')
				.appendTo(this.inner);

            this.element.append(this.inner);

            this.inner.jTransitions({
                orientation: this.options.orientation,
                duration: this.options.duration,
                flushToTop: this.options.flushToTop,
                flushToLeft: this.options.flushToLeft,
                leftOffset: this.options.leftOffset,
                callback: $.proxy(this._onTransitionComplete, this)
            });

            if (this.options.showControls) {
                this.inner
					.css({
					    left: 75,
					    right: 75
					});

                $('<div class="view-next">')
					.css({
					    position: 'absolute',
					    top: this.element.height() / 2 - 22,
					    right: 10
					})
					.click(
						$.proxy(this.forward, this)
					)
                    .hide()
					.appendTo(this.element);

                $('<div class="view-prev">')
					.css({
					    position: 'absolute',
					    top: this.element.height() / 2 - 22,
					    left: 10
					})
					.click(
						$.proxy(this.back, this)
					)
                    .hide()
					.appendTo(this.element);
            }

            this.inner.jTransitions('refresh');
            this._updateControls();
            return this;
        },

        // Use the _setOption method to respond to changes to options
        _setOption: function (key, value) {
            this.options[key] = value;

            // In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
            // In jQuery UI 1.9 and above, you use the _super method instead

            if (this._super)
                this._super("_setOption", key, value);
            else
                $.Widget.prototype._setOption.apply(this, arguments);
        },

        // Use the destroy method to clean up any modifications your widget has made to the DOM
        destroy: function () {
            // In jQuery UI 1.8, you must invoke the destroy method from the base widget
            // In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method

            $.Widget.prototype.destroy.call(this);
            this._destroy();
        },

        pushView: function (viewName, element) {
            var $el = $(element);
            var $cur = this._getView(viewName);
            var box = this.element.box();
            var orientation = this.options['orientation'];

            $el.css({
                left: orientation == 'horizontal' ? box.width : 0,
                top:  orientation == 'horizontal' ? 0 : box.height
            })
            .addClass('ui-stack-view');

            if ($cur.length == 0)
                this.inner.append($el);
            else
                $cur.replaceWith($el);

			this._trigger('beginTransition', $.Event({ target: $el[0]}), viewName);

            $el.attr('viewname', viewName);
            this.inner
                .jTransitions('active', $el);
        },

        popView: function (viewName) {
            var $cur = this._getView(viewName);
            if (!$cur) $cur = this.inner.children().first();
            
            var next = $cur.next();
            if (next.length == 0) {
            	next = $cur.prev();
            }
            
            this._setCallback(function() {
            	$cur.remove();
            });
            
            if (next.length > 0) {
            	this.inner
            		.jTransitions('active', next);
            } else {
            	this._execCallback();
            }
            
            return $cur;
        },

        gotoView: function (viewName) {
            var $el = this._getView(viewName);
            this.inner
				.jTransitions('active', $el);
        },

        back: function () {
            this.inner
                .jTransitions('prev');
        },

        forward: function () {
            this.inner
                .jTransitions('next');
        },

        _onTransitionComplete: function () {
            if (this.options['showControls']) {
                this._updateControls();
            }
            
            this._execCallback();
            
            var active = this.inner
                .jTransitions('active');
            
            this._trigger('complete', $.Event(), active.attr('viewname'));
        },

        _updateControls: function () {
            var $el = this.inner.jTransitions('active');

            if (this.options.showControls) {
                var index = $el.index(),
                    length = this.inner.children().length;

                if (index == 0)
                    this.element.children('.view-prev').hide();
                else this.element.children('.view-prev').show();

                if (length == 1 || index == (length - 1))
                    this.element.children('.view-next').hide();
                else this.element.children('.view-next').show();

                if (index > 0 && index < (length - 1)) {
                    this.element.children('.view-prev, .view-next').show();
                }
            }
        },

        _getView: function (viewName) {
            return this.inner
                .children('[viewname="' + viewName + '"]')
                .first();
        },
        
        _setCallback: function(fn) {
        	this.__callback__ = fn;
        },
        _execCallback: function() {
        	if (this.__callback__) {
        		this.__callback__();
        	}
        	
        	this.__callback__ = undefined;
        }
    });
})(jQuery);