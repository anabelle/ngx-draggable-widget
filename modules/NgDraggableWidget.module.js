// tslint:disable:quotemark
import { NgModule } from '@angular/core';
import { NgWidgetContainer, NgWidget, NgWidgetPlaceholder } from '../main';
var NgDraggableWidgetModule = (function () {
    function NgDraggableWidgetModule() {
    }
    NgDraggableWidgetModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [NgWidgetContainer, NgWidget, NgWidgetPlaceholder],
                    entryComponents: [NgWidgetPlaceholder],
                    exports: [NgWidgetContainer, NgWidget]
                },] },
    ];
    /** @nocollapse */
    NgDraggableWidgetModule.ctorParameters = function () { return []; };
    return NgDraggableWidgetModule;
}());
export { NgDraggableWidgetModule };
//# sourceMappingURL=NgDraggableWidget.module.js.map