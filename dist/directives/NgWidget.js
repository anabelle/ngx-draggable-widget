import { NgWidgetContainer } from "./NgWidgetContainer";
import { Directive, ElementRef, Renderer, EventEmitter, KeyValueDiffers, ViewContainerRef, Output } from '@angular/core';
/**
 *	inputs array instead of @input decorator for ionic compatibility
 */
var NgWidget = /** @class */ (function () {
    // 	constructor
    function NgWidget(_differs, _ngEl, _renderer, _ngWidgetContainer, containerRef) {
        this._differs = _differs;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this._ngWidgetContainer = _ngWidgetContainer;
        this.containerRef = containerRef;
        // 	event Emitters
        this.onItemChange = new EventEmitter(false);
        this.onDragStart = new EventEmitter();
        this.onDrag = new EventEmitter();
        this.onDragStop = new EventEmitter();
        this.onDragAny = new EventEmitter();
        this.onResizeStart = new EventEmitter();
        this.onResize = new EventEmitter();
        this.onResizeStop = new EventEmitter();
        this.onResizeAny = new EventEmitter();
        this.onChangeStart = new EventEmitter();
        this.onChange = new EventEmitter();
        this.onChangeStop = new EventEmitter();
        this.onChangeAny = new EventEmitter();
        this.ngWidgetChange = new EventEmitter();
        // 	default config
        this.isFixed = false;
        this.isDraggable = true;
        this.isResizable = true;
        this.minWidth = 0;
        this.minHeight = 0;
        this._currentPosition = { col: 1, row: 1 };
        this._size = { x: 1, y: 1 };
        this._config = NgWidget.CONST_DEFAULT_CONFIG;
        this._added = false;
        this._maxCols = 0;
        this._minCols = 0;
        this._maxRows = 0;
        this._minRows = 0;
        this._dragStartPosition = { col: 1, row: 1 };
    }
    Object.defineProperty(NgWidget.prototype, "config", {
        // 	[ng-widget] handler
        set: function (v) {
            var defaults = NgWidget.CONST_DEFAULT_CONFIG;
            for (var x in defaults) {
                if (!v[x]) {
                    v[x] = defaults[x];
                }
            }
            this.setConfig(v);
            if (this._differ == null && v != null) {
                this._differ = this._differs.find(this._config).create(null);
            }
            if (!this._added) {
                this._added = true;
                this._ngWidgetContainer.addItem(this);
            }
            this._recalculateDimensions();
            this._recalculatePosition();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgWidget.prototype, "sizex", {
        get: function () {
            return this._size.x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgWidget.prototype, "sizey", {
        get: function () {
            return this._size.y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgWidget.prototype, "col", {
        get: function () {
            return this._currentPosition.col;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgWidget.prototype, "row", {
        get: function () {
            return this._currentPosition.row;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgWidget.prototype, "currentCol", {
        get: function () {
            return this._currentPosition.col;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgWidget.prototype, "currentRow", {
        get: function () {
            return this._currentPosition.row;
        },
        enumerable: true,
        configurable: true
    });
    NgWidget.prototype.onResizeStartEvent = function () {
        var event = this.getEventOutput();
        this._renderer.setElementStyle(this._ngEl.nativeElement, 'z-index', String(++this._ngWidgetContainer.zIndex + 35));
        this.onResizeStart.emit(event);
        this.onResizeAny.emit(event);
        this.onChangeStart.emit(event);
        this.onChangeAny.emit(event);
    };
    NgWidget.prototype.onResizeEvent = function () {
        var event = this.getEventOutput();
        this.onResize.emit(event);
        this.onResizeAny.emit(event);
        this.onChange.emit(event);
        this.onChangeAny.emit(event);
    };
    NgWidget.prototype.onResizeStopEvent = function () {
        var event = this.getEventOutput();
        this.onResizeStop.emit(event);
        this.onResizeAny.emit(event);
        this.onChangeStop.emit(event);
        this.onChangeAny.emit(event);
        this._config.sizex = this._size.x;
        this._config.sizey = this._size.y;
        this.ngWidgetChange.emit(this._config);
    };
    NgWidget.prototype.onDragStartEvent = function () {
        var event = this.getEventOutput();
        this._renderer.setElementStyle(this._ngEl.nativeElement, "z-index", String(++this._ngWidgetContainer.zIndex + 35));
        this.onDragStart.emit(event);
        this.onDragAny.emit(event);
        this.onChangeStart.emit(event);
        this.onChangeAny.emit(event);
    };
    NgWidget.prototype.onDragEvent = function () {
        var event = this.getEventOutput();
        this.onDrag.emit(event);
        this.onDragAny.emit(event);
        this.onChange.emit(event);
        this.onChangeAny.emit(event);
    };
    NgWidget.prototype.onDragStopEvent = function () {
        var event = this.getEventOutput();
        this.onDragStop.emit(event);
        this.onDragAny.emit(event);
        this.onChangeStop.emit(event);
        this.onChangeAny.emit(event);
        this._config.col = this._currentPosition.col;
        this._config.row = this._currentPosition.row;
        this.ngWidgetChange.emit(this._config);
    };
    NgWidget.prototype.onCascadeEvent = function () {
        this._config.sizex = this._size.x;
        this._config.sizey = this._size.y;
        this._config.col = this._currentPosition.col;
        this._config.row = this._currentPosition.row;
        this.ngWidgetChange.emit(this._config);
    };
    NgWidget.prototype.ngOnInit = function () {
        console.log("ngOnInit");
        this._renderer.setElementClass(this._ngEl.nativeElement, "widget", true);
        if (this._ngWidgetContainer.autoStyle) {
            this._renderer.setElementStyle(this._ngEl.nativeElement, "position", "absolute");
        }
        this._recalculateDimensions();
        this._recalculatePosition();
        if (!this._added) {
            this._added = true;
            this._ngWidgetContainer.addItem(this);
        }
    };
    // 	public methods
    NgWidget.prototype.canDrag = function (e) {
        if (!this.isDraggable)
            return false;
        if (this._dragHandle) {
            return this.findHandle(this._dragHandle, e.target);
        }
        return true;
    };
    // tslint:disable:curly
    NgWidget.prototype.findHandle = function (handleSelector, startElement) {
        try {
            var targetElem = startElement;
            while (targetElem && targetElem !== this._ngEl.nativeElement) {
                if (this.elementMatches(targetElem, handleSelector))
                    return true;
                targetElem = targetElem.parentElement;
            }
            // tslint:disable-next-line:no-empty
        }
        catch (err) { }
        return false;
    };
    NgWidget.prototype.canResize = function (e) {
        console.log("isResizable,_resizeHandle,_borderSize", this.isResizable, this._resizeHandle, this._borderSize);
        if (!this.isResizable)
            return null;
        if (this._resizeHandle) {
            return this.findHandle(this._resizeHandle, e.target) ? "both" : null;
        }
        if (this._borderSize <= 0)
            return null;
        // const mousePos: INgWidgetContainerRawPosition = this._getMousePosition(e);
        // if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize
        // 	&& mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
        // 	return 'both';
        // } else if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize) {
        // 	return 'width';
        // } else if (mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
        // 	return 'height';
        // }
        return this.getResizeDirection(e);
        // return null;
    };
    NgWidget.prototype.getResizeDirection = function (e) {
        var mousePos = this._getMousePosition(e);
        if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize
            && mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
            return "both";
        }
        else if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize) {
            return "width";
        }
        else if (mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
            return "height";
        }
        else
            return null;
    };
    NgWidget.prototype.onMouseMove = function (e) {
        if (this._ngWidgetContainer.autoStyle) {
            if (this._ngWidgetContainer.resizeEnable && !this._resizeHandle && this.isResizable) {
                var mousePos = this._getMousePosition(e);
                if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize
                    && mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
                    this._renderer.setElementStyle(this._ngEl.nativeElement, "cursor", "nwse-resize");
                }
                else if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize) {
                    this._renderer.setElementStyle(this._ngEl.nativeElement, "cursor", "ew-resize");
                }
                else if (mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
                    this._renderer.setElementStyle(this._ngEl.nativeElement, "cursor", "ns-resize");
                }
                else if (this._ngWidgetContainer.dragEnable && this.canDrag(e)) {
                    this._renderer.setElementStyle(this._ngEl.nativeElement, "cursor", "move");
                }
                else {
                    this._renderer.setElementStyle(this._ngEl.nativeElement, "cursor", "default");
                }
            }
            else if (this._ngWidgetContainer.resizeEnable && this.canResize(e)) {
                this._renderer.setElementStyle(this._ngEl.nativeElement, "cursor", "nwse-resize");
            }
            else if (this._ngWidgetContainer.dragEnable && this.canDrag(e)) {
                this._renderer.setElementStyle(this._ngEl.nativeElement, "cursor", "move");
            }
            else {
                this._renderer.setElementStyle(this._ngEl.nativeElement, "cursor", "default");
            }
        }
    };
    NgWidget.prototype.ngOnDestroy = function () {
        if (this._added) {
            this._ngWidgetContainer.removeItem(this);
        }
    };
    // 	getters
    NgWidget.prototype.getElement = function () {
        return this._ngEl;
    };
    NgWidget.prototype.getDragHandle = function () {
        return this._dragHandle;
    };
    NgWidget.prototype.getResizeHandle = function () {
        return this._resizeHandle;
    };
    NgWidget.prototype.getDimensions = function () {
        return { "width": this._elemWidth, "height": this._elemHeight };
    };
    NgWidget.prototype.getSize = function () {
        return this._size;
    };
    NgWidget.prototype.getPosition = function () {
        return { "left": this._elemLeft, "top": this._elemTop };
    };
    NgWidget.prototype.getWidgetPosition = function () {
        return this._currentPosition;
    };
    NgWidget.prototype.getWidgetDragStartPosition = function () {
        return this._dragStartPosition;
    };
    // 	setters
    NgWidget.prototype.setWidgetDragStartPosition = function (position) {
        this._dragStartPosition = position;
    };
    NgWidget.prototype.setConfig = function (config) {
        console.log(config);
        this._config = config;
        this._payload = config.payload;
        this._currentPosition.col = config.col ? config.col : NgWidget.CONST_DEFAULT_CONFIG.col;
        this._currentPosition.row = config.row ? config.row : NgWidget.CONST_DEFAULT_CONFIG.row;
        if (!this._added && ((this._ngWidgetContainer.getConfig().widget_width_factor && config.unitx) != null)) {
            this._size.x = this._ngWidgetContainer.widget_width_factor * config.unitx;
            console.log(this._size.x, this._ngWidgetContainer.widget_width_factor * config.unitx);
        }
        else {
            this._size.x = config.sizex ? config.sizex : NgWidget.CONST_DEFAULT_CONFIG.sizex;
        }
        if (!this._added && ((this._ngWidgetContainer.getConfig().widget_height_factor && config.unity) != null)) {
            this._size.y = this._ngWidgetContainer.widget_height_factor * config.unity;
        }
        else {
            this._size.y = config.sizey ? config.sizey : NgWidget.CONST_DEFAULT_CONFIG.sizey;
        }
        this._dragHandle = config.dragHandle;
        this._resizeHandle = config.resizeHandle;
        this._borderSize = config.borderSize;
        this.isDraggable = config.draggable ? true : false;
        this.isResizable = config.resizable ? true : false;
        this.isFixed = config.fixed ? true : false;
        this._maxCols = !isNaN(config.maxCols) && isFinite(config.maxCols) ? config.maxCols : 0;
        this._minCols = !isNaN(config.minCols) && isFinite(config.minCols) ? config.minCols : 0;
        this._maxRows = !isNaN(config.maxRows) && isFinite(config.maxRows) ? config.maxRows : 0;
        this._minRows = !isNaN(config.minRows) && isFinite(config.minRows) ? config.minRows : 0;
        this.minWidth = !isNaN(config.minWidth) && isFinite(config.minWidth) ? config.minWidth : 0;
        this.minHeight = !isNaN(config.minHeight) && isFinite(config.minHeight) ? config.minHeight : 0;
        if (this._minCols > 0 && this._maxCols > 0 && this._minCols > this._maxCols) {
            this._minCols = 0;
        }
        if (this._minRows > 0 && this._maxRows > 0 && this._minRows > this._maxRows) {
            this._minRows = 0;
        }
        if (this._added) {
            this._ngWidgetContainer.updateItem(this);
        }
        this._size = this.fixResize(this._size);
        this._recalculatePosition();
        this._recalculateDimensions();
    };
    NgWidget.prototype.ngDoCheck = function () {
        if (this._differ != null) {
            var changes = this._differ.diff(this._config);
            if (changes != null) {
                console.log("ngDoCheck -> NgWidget");
                this._applyChanges(changes);
                return true;
            }
        }
        return false;
    };
    NgWidget.prototype.setSize = function (newSize, update) {
        if (update === void 0) { update = true; }
        newSize = this.fixResize(newSize);
        this._size = newSize;
        if (update) {
            this._recalculateDimensions();
        }
        this.onItemChange.emit(this.getEventOutput());
    };
    NgWidget.prototype.setGridPosition = function (widgetPosition, update) {
        if (update === void 0) { update = true; }
        console.log("widget -> setGridPosition", widgetPosition);
        this._currentPosition = widgetPosition;
        if (update) {
            this._recalculatePosition();
        }
        this.onItemChange.emit(this.getEventOutput());
    };
    NgWidget.prototype.getEventOutput = function () {
        return {
            payload: this._payload,
            col: this._currentPosition.col,
            row: this._currentPosition.row,
            sizex: this._size.x,
            sizey: this._size.y,
            width: this._elemWidth,
            height: this._elemHeight,
            left: this._elemLeft,
            top: this._elemTop
        };
    };
    NgWidget.prototype.setPosition = function (x, y) {
        switch (this._cascadeMode) {
            case "up":
            case "left":
            default:
                this._renderer.setElementStyle(this._ngEl.nativeElement, "left", x + "px");
                this._renderer.setElementStyle(this._ngEl.nativeElement, "top", y + "px");
                break;
            case "right":
                this._renderer.setElementStyle(this._ngEl.nativeElement, "right", x + "px");
                this._renderer.setElementStyle(this._ngEl.nativeElement, "top", y + "px");
                break;
            case "down":
                this._renderer.setElementStyle(this._ngEl.nativeElement, "left", x + "px");
                this._renderer.setElementStyle(this._ngEl.nativeElement, "bottom", y + "px");
                break;
        }
        this._elemLeft = x;
        this._elemTop = y;
    };
    NgWidget.prototype.setCascadeMode = function (cascade) {
        this._cascadeMode = cascade;
        switch (cascade) {
            case "up":
            case "left":
            default:
                this._renderer.setElementStyle(this._ngEl.nativeElement, "left", this._elemLeft + "px");
                this._renderer.setElementStyle(this._ngEl.nativeElement, "top", this._elemTop + "px");
                this._renderer.setElementStyle(this._ngEl.nativeElement, "right", null);
                this._renderer.setElementStyle(this._ngEl.nativeElement, "bottom", null);
                break;
            case "right":
                this._renderer.setElementStyle(this._ngEl.nativeElement, "right", this._elemLeft + "px");
                this._renderer.setElementStyle(this._ngEl.nativeElement, "top", this._elemTop + "px");
                this._renderer.setElementStyle(this._ngEl.nativeElement, "left", null);
                this._renderer.setElementStyle(this._ngEl.nativeElement, "bottom", null);
                break;
            case "down":
                this._renderer.setElementStyle(this._ngEl.nativeElement, "left", this._elemLeft + "px");
                this._renderer.setElementStyle(this._ngEl.nativeElement, "bottom", this._elemTop + "px");
                this._renderer.setElementStyle(this._ngEl.nativeElement, "right", null);
                this._renderer.setElementStyle(this._ngEl.nativeElement, "top", null);
                break;
        }
    };
    NgWidget.prototype.setDimensions = function (w, h) {
        if (w < this.minWidth) {
            w = this.minWidth;
        }
        if (h < this.minHeight) {
            h = this.minHeight;
        }
        this._renderer.setElementStyle(this._ngEl.nativeElement, "width", w + "px");
        this._renderer.setElementStyle(this._ngEl.nativeElement, "height", h + "px");
        this._elemWidth = w;
        this._elemHeight = h;
    };
    NgWidget.prototype.startMoving = function () {
        this._renderer.setElementClass(this._ngEl.nativeElement, "moving", true);
        var style = window.getComputedStyle(this._ngEl.nativeElement);
        if (this._ngWidgetContainer.autoStyle) {
            this._renderer.setElementStyle(this._ngEl.nativeElement, "z-index", (parseInt(style.getPropertyValue("z-index"), 10) + 1).toString());
        }
    };
    NgWidget.prototype.stopMoving = function () {
        this._renderer.setElementClass(this._ngEl.nativeElement, "moving", false);
        var style = window.getComputedStyle(this._ngEl.nativeElement);
        if (this._ngWidgetContainer.autoStyle) {
            this._renderer.setElementStyle(this._ngEl.nativeElement, "z-index", (parseInt(style.getPropertyValue("z-index"), 10) - 1).toString());
        }
    };
    NgWidget.prototype.recalculateSelf = function () {
        this._recalculatePosition();
        this._recalculateDimensions();
    };
    NgWidget.prototype.fixResize = function (newSize) {
        if (this._maxCols > 0 && newSize.x > this._maxCols)
            newSize.x = this._maxCols;
        if (this._maxRows > 0 && newSize.y > this._maxRows)
            newSize.y = this._maxRows;
        if (this._minCols > 0 && newSize.x < this._minCols)
            newSize.x = this._minCols;
        if (this._minRows > 0 && newSize.y < this._minRows)
            newSize.y = this._minRows;
        var itemWidth = (newSize.x * this._ngWidgetContainer.colWidth) + ((this._ngWidgetContainer.marginLeft + this._ngWidgetContainer.marginRight) * (newSize.x - 1));
        if (itemWidth < this.minWidth)
            newSize.x = Math.round(Math.ceil((this.minWidth + this._ngWidgetContainer.marginRight + this._ngWidgetContainer.marginLeft) / (this._ngWidgetContainer.colWidth + this._ngWidgetContainer.marginRight + this._ngWidgetContainer.marginLeft)));
        var itemHeight = (newSize.y * this._ngWidgetContainer.rowHeight) + ((this._ngWidgetContainer.marginTop + this._ngWidgetContainer.marginBottom) * (newSize.y - 1));
        if (itemHeight < this.minHeight)
            newSize.y = Math.round(Math.ceil((this.minHeight + this._ngWidgetContainer.marginBottom + this._ngWidgetContainer.marginTop) / (this._ngWidgetContainer.rowHeight + this._ngWidgetContainer.marginBottom + this._ngWidgetContainer.marginTop)));
        return newSize;
    };
    // 	private methods
    NgWidget.prototype.elementMatches = function (element, selector) {
        if (!element)
            return false;
        if (element.matches)
            return element.matches(selector);
        if (element.oMatchesSelector)
            return element.oMatchesSelector(selector);
        if (element.msMatchesSelector)
            return element.msMatchesSelector(selector);
        if (element.mozMatchesSelector)
            return element.mozMatchesSelector(selector);
        if (element.webkitMatchesSelector)
            return element.webkitMatchesSelector(selector);
        if (!element.document || !element.ownerDocument)
            return false;
        var matches = (element.document || element.ownerDocument).querySelectorAll(selector);
        var i = matches.length;
        while (--i >= 0 && matches.item(i) !== element) { }
        return i > -1;
    };
    NgWidget.prototype._recalculatePosition = function () {
        var x = (this._ngWidgetContainer.colWidth + this._ngWidgetContainer.marginLeft + this._ngWidgetContainer.marginRight) * (this._currentPosition.col - 1) + this._ngWidgetContainer.marginLeft;
        var y = (this._ngWidgetContainer.rowHeight + this._ngWidgetContainer.marginTop + this._ngWidgetContainer.marginBottom) * (this._currentPosition.row - 1) + this._ngWidgetContainer.marginTop;
        this.setPosition(x, y);
    };
    NgWidget.prototype._recalculateDimensions = function () {
        if (this._size.x < this._ngWidgetContainer.minCols)
            this._size.x = this._ngWidgetContainer.minCols;
        if (this._size.y < this._ngWidgetContainer.minRows)
            this._size.y = this._ngWidgetContainer.minRows;
        var newWidth = (this._ngWidgetContainer.colWidth * this._size.x) + ((this._ngWidgetContainer.marginLeft + this._ngWidgetContainer.marginRight) * (this._size.x - 1));
        var newHeight = (this._ngWidgetContainer.rowHeight * this._size.y) + ((this._ngWidgetContainer.marginTop + this._ngWidgetContainer.marginBottom) * (this._size.y - 1));
        var w = Math.max(this.minWidth, this._ngWidgetContainer.minWidth, newWidth);
        var h = Math.max(this.minHeight, this._ngWidgetContainer.minHeight, newHeight);
        this.setDimensions(w, h);
    };
    NgWidget.prototype._getMousePosition = function (e) {
        if (e.originalEvent && e.originalEvent.touches) {
            var oe = e.originalEvent;
            e = oe.touches.length ? oe.touches[0] : (oe.changedTouches.length ? oe.changedTouches[0] : e);
        }
        else if (e.touches) {
            e = e.touches.length ? e.touches[0] : (e.changedTouches.length ? e.changedTouches[0] : e);
        }
        var refPos = this._ngEl.nativeElement.getBoundingClientRect();
        return {
            left: e.clientX - refPos.left,
            top: e.clientY - refPos.top
        };
    };
    NgWidget.prototype._applyChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) { _this._config[record.key] = record.currentValue; });
        changes.forEachChangedItem(function (record) { _this._config[record.key] = record.currentValue; });
        changes.forEachRemovedItem(function (record) { delete _this._config[record.key]; });
        this.setConfig(this._config);
    };
    NgWidget.CONST_DEFAULT_CONFIG = {
        col: 1,
        row: 1,
        sizex: 1,
        sizey: 1,
        dragHandle: null,
        resizeHandle: null,
        fixed: false,
        draggable: true,
        resizable: true,
        borderSize: 25,
        unitx: 0,
        unity: 0
    };
    NgWidget.decorators = [
        { type: Directive, args: [{
                    selector: "[ngWidget]",
                    inputs: ["config: ngWidget"]
                },] },
    ];
    /** @nocollapse */
    NgWidget.ctorParameters = function () { return [
        { type: KeyValueDiffers, },
        { type: ElementRef, },
        { type: Renderer, },
        { type: NgWidgetContainer, },
        { type: ViewContainerRef, },
    ]; };
    NgWidget.propDecorators = {
        'onItemChange': [{ type: Output },],
        'onDragStart': [{ type: Output },],
        'onDrag': [{ type: Output },],
        'onDragStop': [{ type: Output },],
        'onDragAny': [{ type: Output },],
        'onResizeStart': [{ type: Output },],
        'onResize': [{ type: Output },],
        'onResizeStop': [{ type: Output },],
        'onResizeAny': [{ type: Output },],
        'onChangeStart': [{ type: Output },],
        'onChange': [{ type: Output },],
        'onChangeStop': [{ type: Output },],
        'onChangeAny': [{ type: Output },],
        'ngWidgetChange': [{ type: Output },],
    };
    return NgWidget;
}());
export { NgWidget };
//# sourceMappingURL=NgWidget.js.map