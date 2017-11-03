// tslint:disable:max-line-length
// tslint:disable:quotemark
import { Directive, ElementRef, Renderer, EventEmitter, ComponentFactoryResolver, KeyValueDiffers, ViewContainerRef, Output } from '@angular/core';
import { NgWidgetPlaceholder } from '../components/NgWidgetPlaceholder';
var NgWidgetContainer = (function () {
    // 	constructor
    function NgWidgetContainer(_differs, _ngEl, _renderer, componentFactoryResolver, _containerRef) {
        this._differs = _differs;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this.componentFactoryResolver = componentFactoryResolver;
        this._containerRef = _containerRef;
        // 	event Emitters
        this.onDragStart = new EventEmitter();
        this.onDrag = new EventEmitter();
        this.onDragStop = new EventEmitter();
        this.onResizeStart = new EventEmitter();
        this.onResize = new EventEmitter();
        this.onResizeStop = new EventEmitter();
        this.onItemChange = new EventEmitter();
        // 	public variables
        this.colWidth = 250;
        this.rowHeight = 250;
        this.minCols = 1;
        this.minRows = 1;
        this.marginTop = 10;
        this.marginRight = 10;
        this.marginBottom = 10;
        this.marginLeft = 10;
        this.isDragging = false;
        this.isResizing = false;
        this.autoStyle = true;
        this.resizeEnable = true;
        this.dragEnable = true;
        this.cascade = 'up';
        this.minWidth = 100;
        this.minHeight = 100;
        this.zIndex = 1;
        this.allowOverlap = false;
        this.widget_width_factor = 0;
        this.widget_height_factor = 0;
        // 	private variables
        this._items = [];
        this._draggingItem = null;
        this._resizingItem = null;
        this._resizeDirection = null;
        this._itemGrid = {}; // { 1: { 1: null } };
        this._maxCols = 0;
        this._maxRows = 0;
        this._visibleCols = 0;
        this._visibleRows = 0;
        this._setWidth = 250;
        this._setHeight = 250;
        this._posOffset = null;
        this._adding = false;
        this._placeholderRef = null;
        this._fixToGrid = false;
        this._autoResize = false;
        this._destroyed = false;
        this._maintainRatio = false;
        this._preferNew = false;
        this._zoomOnDrag = false;
        this._limitToScreen = false;
        this._curMaxRow = 0;
        this._curMaxCol = 0;
        this._dragReady = false;
        this._resizeReady = false;
        this._config = NgWidgetContainer.CONST_DEFAULT_CONFIG;
    }
    Object.defineProperty(NgWidgetContainer.prototype, "config", {
        // 	[ng-widget-container] attribute handler
        set: function (v) {
            this.setConfig(v);
            if (this._differ == null && v != null) {
                this._differ = this._differs.find(this._config).create(null);
            }
        },
        enumerable: true,
        configurable: true
    });
    // 	public methods
    NgWidgetContainer.prototype.ngOnInit = function () {
        this._renderer.setElementClass(this._ngEl.nativeElement, 'widget-container', true);
        if (this.autoStyle) {
            this._renderer.setElementStyle(this._ngEl.nativeElement, 'position', 'relative');
        }
        this.setConfig(this._config);
    };
    NgWidgetContainer.prototype.ngOnDestroy = function () {
        this._destroyed = true;
    };
    NgWidgetContainer.prototype.getConfig = function () {
        return this._config;
    };
    NgWidgetContainer.prototype.setConfig = function (config) {
        this._config = config;
        var maxColRowChanged = false;
        for (var x in config) {
            if (config.hasOwnProperty(x)) {
                var val = config[x];
                var intVal = !val ? 0 : parseInt(val, 10);
                switch (x) {
                    case 'margins':
                        this.setMargins(val);
                        break;
                    case 'col_width':
                        this.colWidth = Math.max(intVal, 1);
                        break;
                    case 'row_height':
                        this.rowHeight = Math.max(intVal, 1);
                        break;
                    case 'auto_style':
                        this.autoStyle = val ? true : false;
                        break;
                    case 'auto_resize':
                        this._autoResize = val ? true : false;
                        break;
                    case 'draggable':
                        this.dragEnable = val ? true : false;
                        break;
                    case 'resizable':
                        this.resizeEnable = val ? true : false;
                        break;
                    case 'max_rows':
                        maxColRowChanged = maxColRowChanged || this._maxRows !== intVal;
                        this._maxRows = intVal < 0 ? 0 : intVal;
                        break;
                    case 'max_cols':
                        maxColRowChanged = maxColRowChanged || this._maxCols !== intVal;
                        this._maxCols = intVal < 0 ? 0 : intVal;
                        break;
                    case 'visible_rows':
                        this._visibleRows = Math.max(intVal, 0);
                        break;
                    case 'visible_cols':
                        this._visibleCols = Math.max(intVal, 0);
                        break;
                    case 'min_rows':
                        this.minRows = Math.max(intVal, 1);
                        break;
                    case 'min_cols':
                        this.minCols = Math.max(intVal, 1);
                        break;
                    case 'min_height':
                        this.minHeight = Math.max(intVal, 1);
                        break;
                    case 'min_width':
                        this.minWidth = Math.max(intVal, 1);
                        break;
                    case 'zoom_on_drag':
                        this._zoomOnDrag = val ? true : false;
                        break;
                    case 'cascade':
                        if (this.cascade !== val) {
                            this.cascade = val;
                            this._cascadeGrid();
                        }
                        break;
                    case 'fix_to_grid':
                        this._fixToGrid = val ? true : false;
                        break;
                    case 'maintain_ratio':
                        this._maintainRatio = val ? true : false;
                        break;
                    case 'prefer_new':
                        this._preferNew = val ? true : false;
                        break;
                    case 'limit_to_screen':
                        this._limitToScreen = !this._autoResize && !!val;
                        if (this._limitToScreen) {
                            this._maxCols = this._getContainerColumns();
                        }
                        break;
                    case 'allow_overlap':
                        this.allowOverlap = val ? true : false;
                        break;
                    case 'widget_width_factor':
                        this.widget_width_factor = Math.max(intVal, 0);
                        break;
                    case 'widget_height_factor':
                        this.widget_height_factor = Math.max(intVal, 0);
                        break;
                }
            }
        }
        if (this._maintainRatio) {
            if (this.colWidth && this.rowHeight) {
                this._aspectRatio = this.colWidth / this.rowHeight;
            }
            else {
                this._maintainRatio = false;
            }
        }
        if (maxColRowChanged) {
            if (this._maxCols > 0 && this._maxRows > 0) {
                switch (this.cascade) {
                    case 'left':
                    case 'right':
                        this._maxCols = 0;
                        break;
                    case 'up':
                    case 'down':
                    default:
                        this._maxRows = 0;
                        break;
                }
            }
            this.updatePositionsAfterMaxChange();
        }
        this._calculateColWidth();
        this._calculateRowHeight();
        var maxWidth = this._maxCols * this.colWidth;
        var maxHeight = this._maxRows * this.rowHeight;
        if (maxWidth > 0 && this.minWidth > maxWidth)
            this.minWidth = 0.75 * this.colWidth;
        if (maxHeight > 0 && this.minHeight > maxHeight)
            this.minHeight = 0.75 * this.rowHeight;
        if (this.minWidth > this.colWidth)
            this.minCols = Math.max(this.minCols, Math.ceil(this.minWidth / this.colWidth));
        if (this.minHeight > this.rowHeight)
            this.minRows = Math.max(this.minRows, Math.ceil(this.minHeight / this.rowHeight));
        if (this._maxCols > 0 && this.minCols > this._maxCols)
            this.minCols = 1;
        if (this._maxRows > 0 && this.minRows > this._maxRows)
            this.minRows = 1;
        this._updateRatio();
        for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
            var item = _a[_i];
            this._removeFromGrid(item);
            item.setCascadeMode(this.cascade);
        }
        for (var _b = 0, _c = this._items; _b < _c.length; _b++) {
            var item = _c[_b];
            item.recalculateSelf();
            this._addToGrid(item);
        }
        this._cascadeGrid();
        this._filterGrid();
        this._updateSize();
    };
    NgWidgetContainer.prototype.getItemPosition = function (index) {
        return this._items[index].getWidgetPosition();
    };
    NgWidgetContainer.prototype.getItemSize = function (index) {
        return this._items[index].getSize();
    };
    NgWidgetContainer.prototype.ngDoCheck = function () {
        if (this._differ != null) {
            var changes = this._differ.diff(this._config);
            if (changes != null) {
                console.log('ngDoCheck -> NgWidgetContainer');
                this._applyChanges(changes);
                return true;
            }
        }
        return false;
    };
    NgWidgetContainer.prototype.setMargins = function (margins) {
        this.marginTop = Math.max(parseInt(margins[0], 10), 0);
        this.marginRight = margins.length >= 2 ? Math.max(parseInt(margins[1], 10), 0) : this.marginTop;
        this.marginBottom = margins.length >= 3 ? Math.max(parseInt(margins[2], 10), 0) : this.marginTop;
        this.marginBottom = margins.length >= 3 ? Math.max(parseInt(margins[2], 10), 0) : this.marginTop;
        this.marginLeft = margins.length >= 4 ? Math.max(parseInt(margins[3], 10), 0) : this.marginRight;
    };
    NgWidgetContainer.prototype.enableDrag = function () {
        this.dragEnable = true;
    };
    NgWidgetContainer.prototype.disableDrag = function () {
        this.dragEnable = false;
    };
    NgWidgetContainer.prototype.enableResize = function () {
        this.resizeEnable = true;
    };
    NgWidgetContainer.prototype.disableResize = function () {
        this.resizeEnable = false;
    };
    NgWidgetContainer.prototype.addItem = function (ngItem) {
        ngItem.setCascadeMode(this.cascade);
        if (!this._preferNew) {
            var newPos = this._fixGridPosition(ngItem.getWidgetPosition(), ngItem.getSize());
            ngItem.setGridPosition(newPos);
        }
        this._items.push(ngItem);
        this._addToGrid(ngItem);
        this._updateSize();
        ngItem.recalculateSelf();
        ngItem.onCascadeEvent();
        this._emitOnItemChange();
    };
    NgWidgetContainer.prototype.removeItem = function (ngItem) {
        this._removeFromGrid(ngItem);
        for (var x = 0; x < this._items.length; x++) {
            if (this._items[x] === ngItem) {
                this._items.splice(x, 1);
            }
        }
        if (this._destroyed)
            return;
        if (this.allowOverlap)
            return;
        this._cascadeGrid();
        this._updateSize();
        this._items.forEach(function (item) { return item.recalculateSelf(); });
        this._emitOnItemChange();
    };
    NgWidgetContainer.prototype.updateItem = function (ngWidget) {
        this._removeFromGrid(ngWidget);
        this._addToGrid(ngWidget);
        this._cascadeGrid();
        this._updateSize();
        ngWidget.onCascadeEvent();
    };
    NgWidgetContainer.prototype.triggerCascade = function () {
        this._cascadeGrid(null, null);
    };
    NgWidgetContainer.prototype.triggerResize = function () {
        this.resizeEventHandler(null);
    };
    NgWidgetContainer.prototype.resizeEventHandler = function (e) {
        this._calculateColWidth();
        this._calculateRowHeight();
        this._updateRatio();
        if (this._limitToScreen) {
            if (this._maxCols !== this._getContainerColumns()) {
                this._maxCols = this._getContainerColumns();
                this.updatePositionsAfterMaxChange();
                this._cascadeGrid();
            }
        }
        this._filterGrid();
        this._updateSize();
    };
    NgWidgetContainer.prototype.mouseDownEventHandler = function (e) {
        var mousePos = this._getMousePosition(e);
        var widget = this._getItemFromPosition(mousePos);
        if (widget != null) {
            if (this.resizeEnable && widget.canResize(e)) {
                this._resizeReady = true;
                e.preventDefault();
            }
            else if (this.dragEnable && widget.canDrag(e)) {
                this._dragReady = true;
                e.preventDefault();
            }
        }
    };
    NgWidgetContainer.prototype.mouseUpEventHandler = function (e) {
        if (this.isDragging) {
            this._dragStop(e);
        }
        else if (this.isResizing) {
            this._resizeStop(e);
        }
        else if (this._dragReady || this._resizeReady) {
            this._dragReady = false;
            this._resizeReady = false;
        }
    };
    NgWidgetContainer.prototype.mouseMoveEventHandler = function (e) {
        if (this._resizeReady) {
            this._resizeStart(e);
            e.preventDefault();
            return;
        }
        else if (this._dragReady) {
            this._dragStart(e);
            e.preventDefault();
            return;
        }
        if (this.isDragging) {
            this._drag(e);
        }
        else if (this.isResizing) {
            this._resize(e);
        }
        else {
            var mousePos = this._getMousePosition(e);
            var item = this._getItemFromPosition(mousePos);
            if (item) {
                item.onMouseMove(e);
            }
        }
    };
    // 	Private methods
    NgWidgetContainer.prototype.updatePositionsAfterMaxChange = function () {
        for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
            var item = _a[_i];
            var pos = item.getWidgetPosition();
            var dims = item.getSize();
            if (!this._hasGridCollision(pos, dims) && this._isWithinBounds(pos, dims) && dims.x <= this._maxCols && dims.y <= this._maxRows) {
                continue;
            }
            this._removeFromGrid(item);
            if (this._maxCols > 0 && dims.x > this._maxCols) {
                dims.x = this._maxCols;
                item.setSize(dims);
            }
            else if (this._maxRows > 0 && dims.y > this._maxRows) {
                dims.y = this._maxRows;
                item.setSize(dims);
            }
            if (this._hasGridCollision(pos, dims) || !this._isWithinBounds(pos, dims)) {
                var newPosition = this._fixGridPosition(pos, dims);
                item.setGridPosition(newPosition);
            }
            this._addToGrid(item);
        }
    };
    NgWidgetContainer.prototype._calculateColWidth = function () {
        if (this._autoResize) {
            if (this._maxCols > 0 || this._visibleCols > 0) {
                var maxCols = this._maxCols > 0 ? this._maxCols : this._visibleCols;
                var maxWidth = this._ngEl.nativeElement.getBoundingClientRect().width;
                var colWidth = Math.floor(maxWidth / maxCols);
                colWidth -= (this.marginLeft + this.marginRight);
                if (colWidth > 0)
                    this.colWidth = colWidth;
            }
        }
        if (this.colWidth < this.minWidth || this.minCols > this._config.min_cols) {
            this.minCols = Math.max(this._config.min_cols, Math.ceil(this.minWidth / this.colWidth));
        }
    };
    NgWidgetContainer.prototype._calculateRowHeight = function () {
        if (this._autoResize) {
            if (this._maxRows > 0 || this._visibleRows > 0) {
                var maxRows = this._maxRows > 0 ? this._maxRows : this._visibleRows;
                var maxHeight = window.innerHeight - this.marginTop - this.marginBottom;
                var rowHeight = Math.max(Math.floor(maxHeight / maxRows), this.minHeight);
                rowHeight -= (this.marginTop + this.marginBottom);
                if (rowHeight > 0)
                    this.rowHeight = rowHeight;
            }
        }
        if (this.rowHeight < this.minHeight || this.minRows > this._config.min_rows) {
            this.minRows = Math.max(this._config.min_rows, Math.ceil(this.minHeight / this.rowHeight));
        }
    };
    NgWidgetContainer.prototype._updateRatio = function () {
        if (this._autoResize && this._maintainRatio) {
            if (this._maxCols > 0 && this._visibleRows <= 0) {
                this.rowHeight = this.colWidth / this._aspectRatio;
            }
            else if (this._maxRows > 0 && this._visibleCols <= 0) {
                this.colWidth = this._aspectRatio * this.rowHeight;
            }
            else if (this._maxCols === 0 && this._maxRows === 0) {
                if (this._visibleCols > 0) {
                    this.rowHeight = this.colWidth / this._aspectRatio;
                }
                else if (this._visibleRows > 0) {
                    this.colWidth = this._aspectRatio * this.rowHeight;
                }
            }
        }
    };
    NgWidgetContainer.prototype._applyChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) { _this._config[record.key] = record.currentValue; });
        changes.forEachChangedItem(function (record) { _this._config[record.key] = record.currentValue; });
        changes.forEachRemovedItem(function (record) { delete _this._config[record.key]; });
        this.setConfig(this._config);
    };
    NgWidgetContainer.prototype._resizeStart = function (e) {
        if (this.resizeEnable) {
            var mousePos = this._getMousePosition(e);
            var item = this._getItemFromPosition(mousePos);
            if (item) {
                item.startMoving();
                this._resizingItem = item;
                this._resizeDirection = item.canResize(e);
                this._removeFromGrid(item);
                this._createPlaceholder(item);
                this.isResizing = true;
                this._resizeReady = false;
                this.onResizeStart.emit(item);
                item.onResizeStartEvent();
            }
        }
    };
    NgWidgetContainer.prototype._dragStart = function (e) {
        if (this.dragEnable) {
            var mousePos = this._getMousePosition(e);
            var item = this._getItemFromPosition(mousePos);
            if (item) {
                var itemPos = item.getPosition();
                var pOffset = { 'left': (mousePos.left - itemPos.left), 'top': (mousePos.top - itemPos.top) };
                item.setWidgetDragStartPosition(item.getWidgetPosition());
                console.log('_dragStart -> dragStartPosition', item.getWidgetDragStartPosition());
                item.startMoving();
                this._draggingItem = item;
                this._posOffset = pOffset;
                this._removeFromGrid(item);
                this._createPlaceholder(item);
                this.isDragging = true;
                this._dragReady = false;
                this.onDragStart.emit(item);
                item.onDragStartEvent();
                if (this._zoomOnDrag) {
                    this._zoomOut();
                }
            }
        }
    };
    NgWidgetContainer.prototype._zoomOut = function () {
        this._renderer.setElementStyle(this._ngEl.nativeElement, 'transform', 'scale(0.5, 0.5)');
    };
    NgWidgetContainer.prototype._resetZoom = function () {
        this._renderer.setElementStyle(this._ngEl.nativeElement, 'transform', '');
    };
    NgWidgetContainer.prototype._drag = function (e) {
        if (this.isDragging) {
            console.log('_drag');
            if (window.getSelection) {
                if (window.getSelection().empty) {
                    window.getSelection().empty();
                }
                else if (window.getSelection().removeAllRanges) {
                    window.getSelection().removeAllRanges();
                }
            }
            else if (document.selection) {
                document.selection.empty();
            }
            var mousePos = this._getMousePosition(e);
            var newL = (mousePos.left - this._posOffset.left);
            var newT = (mousePos.top - this._posOffset.top);
            var itemPos = this._draggingItem.getWidgetPosition();
            var gridPos = this._calculateGridPosition(newL, newT);
            var dims = this._draggingItem.getSize();
            gridPos = this._fixPosToBoundsX(gridPos, dims);
            if (!this._isWithinBoundsY(gridPos, dims)) {
                gridPos = this._fixPosToBoundsY(gridPos, dims);
            }
            if (gridPos.col !== itemPos.col || gridPos.row !== itemPos.row) {
                // if (Math.abs(gridPos.col - itemPos.col) > 10 || Math.abs(gridPos.row - itemPos.row) > 10) {
                console.log('_drag', gridPos, itemPos);
                this._draggingItem.setGridPosition(gridPos, this._fixToGrid);
                this._placeholderRef.instance.setGridPosition(gridPos);
                if (['up', 'down', 'left', 'right'].indexOf(this.cascade) >= 0) {
                    if (Math.abs(gridPos.col - itemPos.col) > 10 || Math.abs(gridPos.row - itemPos.row) > 10) {
                        console.log('_drag fixGridCollision', gridPos, dims);
                        this._fixGridCollisions(gridPos, dims);
                    }
                    console.log('_drag cascade', gridPos, dims);
                    this._cascadeGrid(gridPos, dims);
                }
            }
            if (!this._fixToGrid) {
                this._draggingItem.setPosition(newL, newT);
            }
            this.onDrag.emit(this._draggingItem);
            this._draggingItem.onDragEvent();
        }
    };
    NgWidgetContainer.prototype._resize = function (e) {
        if (this.isResizing) {
            if (window.getSelection) {
                if (window.getSelection().empty) {
                    window.getSelection().empty();
                }
                else if (window.getSelection().removeAllRanges) {
                    window.getSelection().removeAllRanges();
                }
            }
            else if (document.selection) {
                document.selection.empty();
            }
            var mousePos = this._getMousePosition(e);
            var itemPos = this._resizingItem.getPosition();
            var itemDims = this._resizingItem.getDimensions();
            var newW = this._resizeDirection === 'height' ? itemDims.width : (mousePos.left - itemPos.left + 10);
            var newH = this._resizeDirection === 'width' ? itemDims.height : (mousePos.top - itemPos.top + 10);
            if (newW < this.minWidth)
                newW = this.minWidth;
            if (newH < this.minHeight)
                newH = this.minHeight;
            if (newW < this._resizingItem.minWidth)
                newW = this._resizingItem.minWidth;
            if (newH < this._resizingItem.minHeight)
                newH = this._resizingItem.minHeight;
            var calcSize = this._calculateGridSize(newW, newH);
            var itemSize = this._resizingItem.getSize();
            var iGridPos = this._resizingItem.getWidgetPosition();
            if (!this._isWithinBoundsX(iGridPos, calcSize))
                calcSize = this._fixSizeToBoundsX(iGridPos, calcSize);
            if (!this._isWithinBoundsY(iGridPos, calcSize))
                calcSize = this._fixSizeToBoundsY(iGridPos, calcSize);
            calcSize = this._resizingItem.fixResize(calcSize);
            if (calcSize.x !== itemSize.x || calcSize.y !== itemSize.y) {
                this._resizingItem.setSize(calcSize, this._fixToGrid);
                this._placeholderRef.instance.setSize(calcSize);
                if (['up', 'down', 'left', 'right'].indexOf(this.cascade) >= 0) {
                    this._fixGridCollisions(iGridPos, calcSize);
                    this._cascadeGrid(iGridPos, calcSize);
                }
            }
            if (!this._fixToGrid)
                this._resizingItem.setDimensions(newW, newH);
            var bigGrid = this._maxGridSize(itemPos.left + newW + (2 * e.movementX), itemPos.top + newH + (2 * e.movementY));
            if (this._resizeDirection === 'height')
                bigGrid.x = iGridPos.col + itemSize.x;
            if (this._resizeDirection === 'width')
                bigGrid.y = iGridPos.row + itemSize.y;
            this.onResize.emit(this._resizingItem);
            this._resizingItem.onResizeEvent();
        }
    };
    NgWidgetContainer.prototype._dragStop = function (e) {
        if (this.isDragging) {
            this.isDragging = false;
            var itemPos = this._draggingItem.getWidgetPosition();
            var itemDragStartPos = this._draggingItem.getWidgetDragStartPosition();
            console.log('_dragStop itemPos, dragStartPos', itemPos, itemDragStartPos);
            this._draggingItem.setGridPosition(itemPos);
            // if (this.allowOverlap) {
            // 	this._draggingItem.setGridPosition(itemPos);
            // } else {
            // 	if (Math.abs(itemPos.row - itemDragStartPos.row) > 4 ) {
            // 		console.log('_dragStop setGrid itemPos');
            // 		this._draggingItem.setGridPosition(itemPos);
            // 	} else {
            // 		console.log('_dragStop setGrid itemDragStartPos');
            // 		const newPos: INgWidgetPosition = { col: itemPos.col, row: itemDragStartPos.row };
            // 		this._draggingItem.setGridPosition(newPos);
            // 	}
            // }
            this._addToGrid(this._draggingItem);
            this._cascadeGrid();
            this._updateSize();
            this._filterGrid();
            this._draggingItem.stopMoving();
            this._draggingItem.onDragStopEvent();
            this.onDragStop.emit(this._draggingItem);
            this._draggingItem = null;
            this._posOffset = null;
            this._placeholderRef.destroy();
            this._emitOnItemChange();
            if (this._zoomOnDrag) {
                this._resetZoom();
            }
        }
    };
    NgWidgetContainer.prototype._resizeStop = function (e) {
        if (this.isResizing) {
            this.isResizing = false;
            var itemDims = this._resizingItem.getSize();
            this._resizingItem.setSize(itemDims);
            this._addToGrid(this._resizingItem);
            this._cascadeGrid();
            this._updateSize();
            this._filterGrid();
            this._resizingItem.stopMoving();
            this._resizingItem.onResizeStopEvent();
            this.onResizeStop.emit(this._resizingItem);
            this._resizingItem = null;
            this._resizeDirection = null;
            this._placeholderRef.destroy();
            this._emitOnItemChange();
        }
    };
    NgWidgetContainer.prototype._maxGridSize = function (w, h) {
        var sizex = Math.ceil(w / (this.colWidth + this.marginLeft + this.marginRight));
        var sizey = Math.ceil(h / (this.rowHeight + this.marginTop + this.marginBottom));
        return { 'x': sizex, 'y': sizey };
    };
    NgWidgetContainer.prototype._calculateGridSize = function (width, height) {
        width += this.marginLeft + this.marginRight;
        height += this.marginTop + this.marginBottom;
        var sizex = Math.max(this.minCols, Math.round(width / (this.colWidth + this.marginLeft + this.marginRight)));
        var sizey = Math.max(this.minRows, Math.round(height / (this.rowHeight + this.marginTop + this.marginBottom)));
        if (!this._isWithinBoundsX({ col: 1, row: 1 }, { x: sizex, y: sizey }))
            sizex = this._maxCols;
        if (!this._isWithinBoundsY({ col: 1, row: 1 }, { x: sizex, y: sizey }))
            sizey = this._maxRows;
        return { 'x': sizex, 'y': sizey };
    };
    NgWidgetContainer.prototype._calculateGridPosition = function (left, top) {
        var col = Math.max(1, Math.round(left / (this.colWidth + this.marginLeft + this.marginRight)) + 1);
        var row = Math.max(1, Math.round(top / (this.rowHeight + this.marginTop + this.marginBottom)) + 1);
        if (!this._isWithinBoundsX({ col: col, row: row }, { x: 1, y: 1 }))
            col = this._maxCols;
        if (!this._isWithinBoundsY({ col: col, row: row }, { x: 1, y: 1 }))
            row = this._maxRows;
        return { 'col': col, 'row': row };
    };
    NgWidgetContainer.prototype._hasGridCollision = function (pos, dims) {
        var positions = this._getCollisions(pos, dims);
        if (positions == null || positions.length === 0)
            return false;
        return positions.some(function (v) {
            return !(v === null);
        });
    };
    NgWidgetContainer.prototype._getCollisions = function (pos, dims) {
        var returns = [];
        if (!pos.col) {
            pos.col = 1;
        }
        if (!pos.row) {
            pos.row = 1;
        }
        for (var j = 0; j < dims.y; j++) {
            if (this._itemGrid[pos.row + j] != null) {
                for (var i = 0; i < dims.x; i++) {
                    if (this._itemGrid[pos.row + j][pos.col + i] != null) {
                        var item = this._itemGrid[pos.row + j][pos.col + i];
                        if (returns.indexOf(item) < 0)
                            returns.push(item);
                        var itemPos = item.getWidgetPosition();
                        var itemDims = item.getSize();
                        i = itemPos.col + itemDims.x - pos.col;
                    }
                }
            }
        }
        return returns;
    };
    NgWidgetContainer.prototype._fixGridCollisions = function (pos, dims) {
        if (this.allowOverlap)
            return;
        while (this._hasGridCollision(pos, dims)) {
            var collisions = this._getCollisions(pos, dims);
            this._removeFromGrid(collisions[0]);
            var itemPos = collisions[0].getWidgetPosition();
            var itemDims = collisions[0].getSize();
            switch (this.cascade) {
                case 'up':
                case 'down':
                default:
                    var oldRow = itemPos.row;
                    itemPos.row = pos.row + dims.y;
                    if (!this._isWithinBoundsY(itemPos, itemDims)) {
                        itemPos.col = pos.col + dims.x;
                        itemPos.row = oldRow;
                    }
                    break;
                case 'left':
                case 'right':
                    var oldCol = itemPos.col;
                    itemPos.col = pos.col + dims.x;
                    if (!this._isWithinBoundsX(itemPos, itemDims)) {
                        itemPos.col = oldCol;
                        itemPos.row = pos.row + dims.y;
                    }
                    break;
            }
            collisions[0].setGridPosition(itemPos);
            this._fixGridCollisions(itemPos, itemDims);
            this._addToGrid(collisions[0]);
            collisions[0].onCascadeEvent();
        }
    };
    NgWidgetContainer.prototype._cascadeGrid = function (pos, dims) {
        if (this._destroyed)
            return;
        if (this.allowOverlap) {
            return;
        }
        if (pos && !dims)
            throw new Error('Cannot cascade with only position and not dimensions');
        if (this.isDragging && this._draggingItem && !pos && !dims) {
            pos = this._draggingItem.getWidgetPosition();
            dims = this._draggingItem.getSize();
        }
        else if (this.isResizing && this._resizingItem && !pos && !dims) {
            pos = this._resizingItem.getWidgetPosition();
            dims = this._resizingItem.getSize();
        }
        switch (this.cascade) {
            case 'up':
            case 'down':
                var lowRow = [0];
                for (var i = 1; i <= this._curMaxCol; i++)
                    lowRow[i] = 1;
                for (var r = 1; r <= this._curMaxRow; r++) {
                    if (this._itemGrid[r] === undefined)
                        continue;
                    for (var c = 1; c <= this._curMaxCol; c++) {
                        if (this._itemGrid[r] === undefined)
                            break;
                        if (r < lowRow[c])
                            continue;
                        if (this._itemGrid[r][c] != null) {
                            var item = this._itemGrid[r][c];
                            if (item.isFixed)
                                continue;
                            var itemPos = item.getWidgetPosition();
                            var itemDims = item.getSize();
                            if (itemPos.col !== c || itemPos.row !== r)
                                continue; // 	if this is not the element's start
                            var lowest = lowRow[c];
                            for (var i = 1; i < itemDims.x; i++) {
                                lowest = Math.max(lowRow[(c + i)], lowest);
                            }
                            if (pos && (c + itemDims.x) > pos.col && c < (pos.col + dims.x)) {
                                if ((r >= pos.row && r < (pos.row + dims.y)) ||
                                    ((itemDims.y > (pos.row - lowest)) &&
                                        (r >= (pos.row + dims.y) && lowest < (pos.row + dims.y)))) {
                                    lowest = Math.round(Math.max(lowest, pos.row + dims.y)); // 	set the lowest row to be below it
                                }
                            }
                            var newPos = { col: c, row: lowest };
                            if (lowest !== itemPos.row && this._isWithinBoundsY(newPos, itemDims)) {
                                this._removeFromGrid(item);
                                item.setGridPosition(newPos);
                                item.onCascadeEvent();
                                this._addToGrid(item);
                            }
                            for (var i = 0; i < itemDims.x; i++) {
                                lowRow[c + i] = lowest + itemDims.y; // 	update the lowest row to be below the item
                            }
                        }
                    }
                }
                break;
            case 'left':
            case 'right':
                var lowCol = [0];
                for (var i = 1; i <= this._curMaxRow; i++)
                    lowCol[i] = 1;
                for (var r = 1; r <= this._curMaxRow; r++) {
                    if (this._itemGrid[r] === undefined)
                        continue;
                    for (var c = 1; c <= this._curMaxCol; c++) {
                        if (this._itemGrid[r] === undefined)
                            break;
                        if (c < lowCol[r])
                            continue;
                        if (this._itemGrid[r][c] != null) {
                            var item = this._itemGrid[r][c];
                            var itemDims = item.getSize();
                            var itemPos = item.getWidgetPosition();
                            if (itemPos.col !== c || itemPos.row !== r)
                                continue; // 	if this is not the element's start
                            var lowest = lowCol[r];
                            for (var i = 1; i < itemDims.y; i++) {
                                lowest = Math.max(lowCol[(r + i)], lowest);
                            }
                            if (pos && (r + itemDims.y) > pos.row && r < (pos.row + dims.y)) {
                                if ((c >= pos.col && c < (pos.col + dims.x)) ||
                                    ((itemDims.x > (pos.col - lowest)) &&
                                        (c >= (pos.col + dims.x) && lowest < (pos.col + dims.x)))) {
                                    lowest = Math.max(lowest, pos.col + dims.x); // 	set the lowest col to be below it
                                }
                            }
                            var newPos = { col: Math.round(lowest), row: r };
                            // if (lowest !== itemPos.col && this._isWithinBoundsX(newPos, itemDims)) {	// 	if the item is not already on this col move it up
                            if (lowest !== itemPos.col && lowest < itemPos.col && this._isWithinBoundsX(newPos, itemDims)) {
                                this._removeFromGrid(item);
                                console.log('_cascadeGrid called setGridPosition', this.cascade, lowest, itemPos, newPos, itemDims);
                                item.setGridPosition(newPos);
                                item.onCascadeEvent();
                                this._addToGrid(item);
                            }
                            for (var i = 0; i < itemDims.y; i++) {
                                lowCol[r + i] = lowest + itemDims.x; // 	update the lowest col to be below the item
                            }
                        }
                    }
                }
                break;
            default:
                break;
        }
    };
    NgWidgetContainer.prototype._cascadePlaceHolder = function (pos, dims) {
        if (this._destroyed)
            return;
        if (this.allowOverlap) {
            return;
        }
        if (pos && !dims)
            throw new Error('Cannot cascade with only position and not dimensions');
        if (this.isDragging && this._draggingItem && !pos && !dims) {
            pos = this._draggingItem.getWidgetPosition();
            dims = this._draggingItem.getSize();
        }
        else if (this.isResizing && this._resizingItem && !pos && !dims) {
            pos = this._resizingItem.getWidgetPosition();
            dims = this._resizingItem.getSize();
        }
        switch (this.cascade) {
            case 'up':
            case 'down':
                var lowRow = [0];
                for (var i = 1; i <= this._curMaxCol; i++)
                    lowRow[i] = 1;
                for (var r = 1; r <= this._curMaxRow; r++) {
                    if (this._itemGrid[r] === undefined)
                        continue;
                    for (var c = 1; c <= this._curMaxCol; c++) {
                        if (this._itemGrid[r] === undefined)
                            break;
                        if (r < lowRow[c])
                            continue;
                        if (this._itemGrid[r][c] != null) {
                            var item = this._itemGrid[r][c];
                            if (item.isFixed)
                                continue;
                            var itemPos = item.getWidgetPosition();
                            var itemDims = item.getSize();
                            if (itemPos.col !== c || itemPos.row !== r)
                                continue; // 	if this is not the element's start
                            var lowest = lowRow[c];
                            for (var i = 1; i < itemDims.x; i++) {
                                lowest = Math.max(lowRow[(c + i)], lowest);
                            }
                            if (pos && (c + itemDims.x) > pos.col && c < (pos.col + dims.x)) {
                                if ((r >= pos.row && r < (pos.row + dims.y)) ||
                                    ((itemDims.y > (pos.row - lowest)) &&
                                        (r >= (pos.row + dims.y) && lowest < (pos.row + dims.y)))) {
                                    lowest = Math.max(lowest, pos.row + dims.y); // 	set the lowest row to be below it
                                }
                            }
                            var newPos = { col: c, row: lowest };
                            if (lowest !== itemPos.row && this._isWithinBoundsY(newPos, itemDims)) {
                                // this._removeFromGrid(item);
                                // item.setGridPosition(newPos);
                                // item.onCascadeEvent();
                                // this._addToGrid(item);
                                this._placeholderRef.instance.setGridPosition(newPos);
                            }
                            for (var i = 0; i < itemDims.x; i++) {
                                lowRow[c + i] = lowest + itemDims.y; // 	update the lowest row to be below the item
                            }
                        }
                    }
                }
                break;
            case 'left':
            case 'right':
                var lowCol = [0];
                for (var i = 1; i <= this._curMaxRow; i++)
                    lowCol[i] = 1;
                for (var r = 1; r <= this._curMaxRow; r++) {
                    if (this._itemGrid[r] === undefined)
                        continue;
                    for (var c = 1; c <= this._curMaxCol; c++) {
                        if (this._itemGrid[r] === undefined)
                            break;
                        if (c < lowCol[r])
                            continue;
                        if (this._itemGrid[r][c] != null) {
                            var item = this._itemGrid[r][c];
                            var itemDims = item.getSize();
                            var itemPos = item.getWidgetPosition();
                            if (itemPos.col !== c || itemPos.row !== r)
                                continue; // 	if this is not the element's start
                            var lowest = lowCol[r];
                            for (var i = 1; i < itemDims.y; i++) {
                                lowest = Math.max(lowCol[(r + i)], lowest);
                            }
                            if (pos && (r + itemDims.y) > pos.row && r < (pos.row + dims.y)) {
                                if ((c >= pos.col && c < (pos.col + dims.x)) ||
                                    ((itemDims.x > (pos.col - lowest)) &&
                                        (c >= (pos.col + dims.x) && lowest < (pos.col + dims.x)))) {
                                    lowest = Math.max(lowest, pos.col + dims.x); // 	set the lowest col to be below it
                                }
                            }
                            var newPos = { col: lowest, row: r };
                            if (lowest !== itemPos.col && lowest < itemPos.col && this._isWithinBoundsX(newPos, itemDims)) {
                                // this._removeFromGrid(item);
                                // console.log('_cascadeGrid called setGridPosition', this.cascade, lowest, itemPos, newPos, itemDims);
                                // item.setGridPosition(newPos);
                                // item.onCascadeEvent();
                                // this._addToGrid(item);
                                this._placeholderRef.instance.setGridPosition(newPos);
                            }
                            for (var i = 0; i < itemDims.y; i++) {
                                lowCol[r + i] = lowest + itemDims.x; // 	update the lowest col to be below the item
                            }
                        }
                    }
                }
                break;
            default:
                break;
        }
    };
    NgWidgetContainer.prototype._fixGridPosition = function (pos, dims) {
        while (this._hasGridCollision(pos, dims) || !this._isWithinBounds(pos, dims)) {
            if (this._hasGridCollision(pos, dims)) {
                var collisions = this._getCollisions(pos, dims);
                switch (this.cascade) {
                    case 'up':
                    case 'down':
                    default:
                        pos.row = Math.max.apply(null, collisions.map(function (item) { return item.row + item.sizey; }));
                        break;
                    case 'left':
                    case 'right':
                        pos.col = Math.max.apply(null, collisions.map(function (item) { return item.col + item.sizex; }));
                        break;
                }
            }
            if (!this._isWithinBoundsY(pos, dims)) {
                pos.col++;
                pos.row = 1;
            }
            if (!this._isWithinBoundsX(pos, dims)) {
                pos.row++;
                pos.col = 1;
            }
        }
        return pos;
    };
    NgWidgetContainer.prototype._isWithinBoundsX = function (pos, dims) {
        return (this._maxCols === 0 || pos.col === 1 || (pos.col + dims.x - 1) <= this._maxCols);
    };
    NgWidgetContainer.prototype._fixPosToBoundsX = function (pos, dims) {
        if (!this._isWithinBoundsX(pos, dims)) {
            pos.col = Math.max(this._maxCols - (dims.x - 1), 1);
            pos.row++;
        }
        return pos;
    };
    NgWidgetContainer.prototype._fixSizeToBoundsX = function (pos, dims) {
        if (!this._isWithinBoundsX(pos, dims)) {
            dims.x = Math.max(this._maxCols - (pos.col - 1), 1);
            dims.y++;
        }
        return dims;
    };
    NgWidgetContainer.prototype._isWithinBoundsY = function (pos, dims) {
        return (this._maxRows === 0 || pos.row === 1 || (pos.row + dims.y - 1) <= this._maxRows);
    };
    NgWidgetContainer.prototype._fixPosToBoundsY = function (pos, dims) {
        if (!this._isWithinBoundsY(pos, dims)) {
            pos.row = Math.max(this._maxRows - (dims.y - 1), 1);
            pos.col++;
        }
        return pos;
    };
    NgWidgetContainer.prototype._fixSizeToBoundsY = function (pos, dims) {
        if (!this._isWithinBoundsY(pos, dims)) {
            dims.y = Math.max(this._maxRows - (pos.row - 1), 1);
            dims.x++;
        }
        return dims;
    };
    NgWidgetContainer.prototype._isWithinBounds = function (pos, dims) {
        return this._isWithinBoundsX(pos, dims) && this._isWithinBoundsY(pos, dims);
    };
    NgWidgetContainer.prototype._fixPosToBounds = function (pos, dims) {
        return this._fixPosToBoundsX(this._fixPosToBoundsY(pos, dims), dims);
    };
    NgWidgetContainer.prototype._fixSizeToBounds = function (pos, dims) {
        return this._fixSizeToBoundsX(pos, this._fixSizeToBoundsY(pos, dims));
    };
    NgWidgetContainer.prototype._addToGrid = function (item) {
        // if( (this.isDragging || this.isResizing) && this.allowOverlap) {
        // 	return;
        // }
        var pos = item.getWidgetPosition();
        var dims = item.getSize();
        if (this._hasGridCollision(pos, dims)) {
            this._fixGridCollisions(pos, dims);
            pos = item.getWidgetPosition();
        }
        for (var j = 0; j < dims.y; j++) {
            if (this._itemGrid[pos.row + j] == null)
                this._itemGrid[pos.row + j] = {};
            for (var i = 0; i < dims.x; i++) {
                this._itemGrid[pos.row + j][pos.col + i] = item;
            }
        }
    };
    NgWidgetContainer.prototype._removeFromGrid = function (item) {
        for (var y in this._itemGrid)
            for (var x in this._itemGrid[y])
                if (this._itemGrid[y][x] === item)
                    delete this._itemGrid[y][x];
    };
    NgWidgetContainer.prototype._filterGrid = function () {
        // tslint:disable:forin
        for (var y in this._itemGrid) {
            for (var x in this._itemGrid[y]) {
                var item = this._itemGrid[y][x];
                var withinRow = y < (item.row + item.sizey) && y >= item.row;
                var withinCol = x < (item.col + item.sizex) && x >= item.col;
                if (this._items.indexOf(this._itemGrid[y][x]) < 0 || !withinRow || !withinCol) {
                    delete this._itemGrid[y][x];
                }
            }
            if (Object.keys(this._itemGrid[y]).length === 0) {
                delete this._itemGrid[y];
            }
        }
    };
    NgWidgetContainer.prototype._updateSize = function () {
        if (this._destroyed)
            return;
        var maxCol = this._getMaxCol();
        var maxRow = this._getMaxRow();
        if (maxCol !== this._curMaxCol || maxRow !== this._curMaxRow) {
            this._curMaxCol = maxCol;
            this._curMaxRow = maxRow;
        }
        this._renderer.setElementStyle(this._ngEl.nativeElement, 'width', '100%'); // (maxCol * (this.colWidth + this.marginLeft + this.marginRight))+'px');
        this._renderer.setElementStyle(this._ngEl.nativeElement, 'height', (maxRow * (this.rowHeight + this.marginTop + this.marginBottom)) + 'px');
    };
    NgWidgetContainer.prototype._getMaxRow = function () {
        return Math.max.apply(null, this._items.map(function (item) { return item.row + item.sizey - 1; }));
    };
    NgWidgetContainer.prototype._getMaxCol = function () {
        return Math.max.apply(null, this._items.map(function (item) { return item.col + item.sizex - 1; }));
    };
    NgWidgetContainer.prototype._getMousePosition = function (e) {
        if ((window.TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches)) {
            e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
        }
        var refPos = this._ngEl.nativeElement.getBoundingClientRect();
        var left = e.clientX - refPos.left;
        var top = e.clientY - refPos.top;
        if (this.cascade === 'down')
            top = refPos.top + refPos.height - e.clientY;
        if (this.cascade === 'right')
            left = refPos.left + refPos.width - e.clientX;
        if (this.isDragging && this._zoomOnDrag) {
            left *= 2;
            top *= 2;
        }
        return {
            left: left,
            top: top
        };
    };
    NgWidgetContainer.prototype._getAbsoluteMousePosition = function (e) {
        if ((window.TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches)) {
            e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
        }
        return {
            left: e.clientX,
            top: e.clientY
        };
    };
    NgWidgetContainer.prototype._getContainerColumns = function () {
        var maxWidth = this._ngEl.nativeElement.getBoundingClientRect().width;
        return Math.floor(maxWidth / (this.colWidth + this.marginLeft + this.marginRight));
    };
    NgWidgetContainer.prototype._getContainerRows = function () {
        var maxHeight = window.innerHeight - this.marginTop - this.marginBottom;
        return Math.floor(maxHeight / (this.rowHeight + this.marginTop + this.marginBottom));
    };
    NgWidgetContainer.prototype._getItemFromPosition = function (position) {
        for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
            var item = _a[_i];
            var size = item.getDimensions();
            var pos = item.getPosition();
            if (position.left > (pos.left + this.marginLeft) && position.left < (pos.left + this.marginLeft + size.width) &&
                position.top > (pos.top + this.marginTop) && position.top < (pos.top + this.marginTop + size.height)) {
                return item;
            }
        }
        return null;
    };
    NgWidgetContainer.prototype._createPlaceholder = function (item) {
        var pos = item.getWidgetPosition();
        var dims = item.getSize();
        var factory = this.componentFactoryResolver.resolveComponentFactory(NgWidgetPlaceholder);
        var componentRef = item.containerRef.createComponent(factory);
        this._placeholderRef = componentRef;
        var placeholder = componentRef.instance;
        placeholder.registerGrid(this);
        placeholder.setCascadeMode(this.cascade);
        placeholder.setGridPosition({ col: pos.col, row: pos.row });
        placeholder.setSize({ x: dims.x, y: dims.y });
    };
    NgWidgetContainer.prototype._emitOnItemChange = function () {
        this.onItemChange.emit(this._items.map(function (item) { return item.getEventOutput(); }));
    };
    // 	default config
    NgWidgetContainer.CONST_DEFAULT_CONFIG = {
        margins: [10],
        draggable: true,
        resizable: true,
        max_cols: 0,
        max_rows: 0,
        visible_cols: 0,
        visible_rows: 0,
        col_width: 250,
        row_height: 250,
        cascade: 'left',
        min_width: 100,
        min_height: 100,
        fix_to_grid: false,
        auto_style: true,
        auto_resize: false,
        maintain_ratio: false,
        prefer_new: false,
        zoom_on_drag: false,
        allow_overlap: false,
        widget_width_factor: 0,
        widget_height_factor: 0
    };
    NgWidgetContainer.decorators = [
        { type: Directive, args: [{
                    selector: '[ngWidgetContainer]',
                    inputs: ['config: ngWidgetContainer'],
                    host: {
                        '(mousedown)': 'mouseDownEventHandler($event)',
                        '(mousemove)': 'mouseMoveEventHandler($event)',
                        '(mouseup)': 'mouseUpEventHandler($event)',
                        '(touchstart)': 'mouseDownEventHandler($event)',
                        '(touchmove)': 'mouseMoveEventHandler($event)',
                        '(touchend)': 'mouseUpEventHandler($event)',
                        '(window:resize)': 'resizeEventHandler($event)',
                        '(document:mousemove)': 'mouseMoveEventHandler($event)',
                        '(document:mouseup)': 'mouseUpEventHandler($event)'
                    }
                },] },
    ];
    /** @nocollapse */
    NgWidgetContainer.ctorParameters = function () { return [
        { type: KeyValueDiffers, },
        { type: ElementRef, },
        { type: Renderer, },
        { type: ComponentFactoryResolver, },
        { type: ViewContainerRef, },
    ]; };
    NgWidgetContainer.propDecorators = {
        'onDragStart': [{ type: Output },],
        'onDrag': [{ type: Output },],
        'onDragStop': [{ type: Output },],
        'onResizeStart': [{ type: Output },],
        'onResize': [{ type: Output },],
        'onResizeStop': [{ type: Output },],
        'onItemChange': [{ type: Output },],
    };
    return NgWidgetContainer;
}());
export { NgWidgetContainer };
//# sourceMappingURL=NgWidgetContainer.js.map