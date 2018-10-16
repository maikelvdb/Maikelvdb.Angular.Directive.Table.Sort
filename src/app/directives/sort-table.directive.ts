import { Directive, Input, OnInit, ElementRef, Renderer2, OnChanges } from '@angular/core';

@Directive({
  selector: '[sort-table]'
})
export class SortTableDirective {
  @Input('default-for') defaultFor: string;
  @Input('sort-table') set setItems(values) {
    this.items = values;
    setTimeout(() => this.itemsInit(), 500);
  }
  private items: Array<any>;
  private original: Array<any>;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) { }

  itemsInit() {    
    var elem = this.elementRef.nativeElement;    
    var headings = elem.querySelector('thead').querySelectorAll('[sort-for]');
    
    for (let head of headings) {
      (function (t) {
        t.renderer.listen(head, 'click', (e) => t.sortTable(e));
      })(this)

      var f = head.getAttribute('sort-for');
      if (f === this.defaultFor) {
        head.click();
      }
    }
    
    this.AddResetCol(elem);
  }
  
  AddResetCol(elem) {
    var resetCol = document.createElement("th");
    resetCol.setAttribute('class', 'col-sort-reset');
    
    this.renderer.appendChild(elem.querySelector('thead').querySelector('tr'), resetCol);
    this.renderer.listen(resetCol, 'click', (e) => this.resetSort(e));

    var rows = elem.querySelector('tbody').querySelectorAll('tr');
    for (let row of rows) {
      var cols = row.querySelectorAll('td');
      var lastCol = cols[cols.length-1];
      this.renderer.setAttribute(lastCol, 'colspan', '2');
    }
  }
  
  resetSort(e) {
      var sortCols = this.elementRef.nativeElement.querySelector('thead').querySelectorAll('[sort-for]');
      for (var col of sortCols) {
        this.renderer.removeAttribute(col, 'sort-order');  
        this.renderer.removeAttribute(col, 'sort-index');
      }

      this.keySort([]);
  }

  sortTable(e) {
    var target = e.target;
    var sortOrder = target.getAttribute('sort-order');
    var mustSetIndex = false;

    if (sortOrder === 'asc') {
      this.renderer.setAttribute(target, 'sort-order', 'desc');
      mustSetIndex = true;
    }
    else if (sortOrder === 'desc') {
      this.renderer.removeAttribute(target, 'sort-order');  
      this.renderer.removeAttribute(target, 'sort-index');  
    }
    else {
      this.renderer.setAttribute(target, 'sort-order', 'asc');
      mustSetIndex = true;
    }

    var elem = this.elementRef.nativeElement;
    var cnt:number[] = new Array<number>();
    elem.querySelectorAll('[sort-index]').forEach((value) => {
      cnt.push(parseInt(value.getAttribute('sort-index')));
    });

    if (mustSetIndex) {
      if (cnt.length === 0) {
        cnt.push(-1);
      }
      this.renderer.setAttribute(target, 'sort-index', (Math.max(...cnt)+1).toString());        
    }

    this.orderList();
  }

  orderList() {
    var sorts = new Array<{index: number, field: string, order: string}>();
    var elem = this.elementRef.nativeElement;
    var sorters = elem.querySelector('thead').querySelectorAll('[sort-index]');

    for (let sortInfo of sorters) {
      var i = parseInt(sortInfo.getAttribute('sort-index'));
      var f = sortInfo.getAttribute('sort-for');
      var o = sortInfo.getAttribute('sort-order');

      sorts.push({index: i, field: f, order: o});
    }
    sorts.sort((a, b) => (a.index > b.index) ? 1 : ((b.index > a.index) ? -1 : 0));

    var sortOrder = [];
    for (let s of sorts) {
      sortOrder.push({property: s.field, order: s.order});
    }
    
    this.keySort(sortOrder);
  }

  keySort(keys) {
    if (!keys || keys.length === 0) {
      // Get default sort order
      this.keySort([{property: this.defaultFor, order: 'asc'}]);
    }
    else {
      this.items.sort((a, b) => {
        for (let k of keys) {
          var prop = k.property;
          var order = k.order;
          
          if (order === 'asc') {
            if (a[prop] > b[prop]) return 1;
            if(b[prop] > a[prop]) return -1;
          }
          else if (order === 'desc') {
            if (a[prop] < b[prop]) return 1;
            if(b[prop] < a[prop]) return -1;
          }
        }

        return 0;
      });
    }
  }
  
  clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }
}