import { Component, ElementRef, Renderer } from '@angular/core';
var NgWidgetPlaceholder = /** @class */ (function () {
    function NgWidgetPlaceholder(_ngEl, _renderer) {
        this._ngEl = _ngEl;
        this._renderer = _renderer;
    }
    // tslint:disable:typedef
    // tslint:disable:curly
    NgWidgetPlaceholder.prototype.registerGrid = function (ngGrid) {
        this._ngWidgetContainer = ngGrid;
    };
    NgWidgetPlaceholder.prototype.ngOnInit = function () {
        this._renderer.setElementClass(this._ngEl.nativeElement, 'widget-placeholder', true);
        if (this._ngWidgetContainer.autoStyle)
            this._renderer.setElementStyle(this._ngEl.nativeElement, 'position', 'absolute');
    };
    NgWidgetPlaceholder.prototype.setSize = function (newSize) {
        this._size = newSize;
        this._recalculateDimensions();
    };
    NgWidgetPlaceholder.prototype.setGridPosition = function (newPosition) {
        this._position = newPosition;
        this._recalculatePosition();
    };
    NgWidgetPlaceholder.prototype.setCascadeMode = function (cascade) {
        this._cascadeMode = cascade;
        switch (cascade) {
            case 'up':
            case 'left':
            default:
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'left', '0px');
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'top', '0px');
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'right', null);
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'bottom', null);
                break;
            case 'right':
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'right', '0px');
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'top', '0px');
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'left', null);
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'bottom', null);
                break;
            case 'down':
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'left', '0px');
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'bottom', '0px');
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'right', null);
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'top', null);
                break;
        }
    };
    // 	private methods
    NgWidgetPlaceholder.prototype._setDimensions = function (w, h) {
        this._renderer.setElementStyle(this._ngEl.nativeElement, 'width', w + 'px');
        this._renderer.setElementStyle(this._ngEl.nativeElement, 'height', h + 'px');
    };
    NgWidgetPlaceholder.prototype._setPosition = function (x, y) {
        switch (this._cascadeMode) {
            case 'up':
            case 'left':
            default:
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'transform', 'translate(' + x + 'px, ' + y + 'px)');
                break;
            case 'right':
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'transform', 'translate(' + -x + 'px, ' + y + 'px)');
                break;
            case 'down':
                this._renderer.setElementStyle(this._ngEl.nativeElement, 'transform', 'translate(' + x + 'px, ' + -y + 'px)');
                break;
        }
    };
    NgWidgetPlaceholder.prototype._recalculatePosition = function () {
        var x = (this._ngWidgetContainer.colWidth + this._ngWidgetContainer.marginLeft + this._ngWidgetContainer.marginRight) * (this._position.col - 1) + this._ngWidgetContainer.marginLeft;
        var y = (this._ngWidgetContainer.rowHeight + this._ngWidgetContainer.marginTop + this._ngWidgetContainer.marginBottom) * (this._position.row - 1) + this._ngWidgetContainer.marginTop;
        this._setPosition(x, y);
    };
    NgWidgetPlaceholder.prototype._recalculateDimensions = function () {
        var w = (this._ngWidgetContainer.colWidth * this._size.x) + ((this._ngWidgetContainer.marginLeft + this._ngWidgetContainer.marginRight) * (this._size.x - 1));
        var h = (this._ngWidgetContainer.rowHeight * this._size.y) + ((this._ngWidgetContainer.marginTop + this._ngWidgetContainer.marginBottom) * (this._size.y - 1));
        this._setDimensions(w, h);
    };
    NgWidgetPlaceholder.decorators = [
        { type: Component, args: [{
                    selector: 'ng-widget-placeholder',
                    template: ''
                },] },
    ];
    /** @nocollapse */
    NgWidgetPlaceholder.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: Renderer, },
    ]; };
    return NgWidgetPlaceholder;
}());
export { NgWidgetPlaceholder };
//# sourceMappingURL=NgWidgetPlaceholder.js.map