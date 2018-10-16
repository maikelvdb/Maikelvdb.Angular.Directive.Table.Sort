import { Directive, Input, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[sort-table]'
})
export class SortTableDirective implements OnInit {
  @Input('sort-table') items;
  private original: Array<any>;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.original = this.items;
    var elem = this.elementRef.nativeElement;
    
    var headings = elem.querySelector('thead').querySelectorAll('th');
    
    var x = 0;
    for (let head of headings) {
      (function (t) {
        t.renderer.listen(head, 'click', (e) => t.sortTable(e));
      })(this)
    }
  }
  
  sortTable(e) {
    var target = e.target;
    var sortOrder = target.getAttribute('sort-order');
    var multi = e.shiftKey;

    if (!multi) {
      var sortCols = this.elementRef.nativeElement.querySelector('thead').querySelectorAll('[sort-for]');
      for (var col of sortCols) {
        this.renderer.removeAttribute(col, 'sort-order');  
        this.renderer.removeAttribute(col, 'sort-index');
      }

      this.renderer.setAttribute(target, 'sort-index', '0');
    }

    if (sortOrder === 'asc') {
      this.renderer.setAttribute(target, 'sort-order', 'desc');

    }
    else if (sortOrder === 'desc') {
      this.renderer.removeAttribute(target, 'sort-order');  
      this.renderer.removeAttribute(target, 'sort-index');  
    }
    else {
      this.renderer.setAttribute(target, 'sort-order', 'asc');
    }

    var elem = this.elementRef.nativeElement;
    var cnt:number[] = new Array<number>();
    elem.querySelectorAll('[sort-index]').forEach((value) => {
      cnt.push(parseInt(value.getAttribute('sort-index')));
    });

    if (target.getAttribute('sort-order'))
    if (cnt.length === 0) {
      cnt.push(-1);
    }
    this.renderer.setAttribute(target, 'sort-index', (Math.max(...cnt)+1).toString());        
    

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

    var sortOrder = new Array();
    for (let s of sorts) {
      sortOrder[s.field] = s.order;
    }
    
    this.keySort(sortOrder);
  }

  keySort(keys) {
      debugger;
    if (!keys) {
      this.items = this.orderList;
    }
    else {
      for (var k in keys) {
        var order = keys[k];
        //debugger;
        if (order === 'asc') {
          this.items.sort((a, b) => (a[k] > b[k]) ? 1 : ((b[k] > a[k]) ? -1 : 0));
        }
        else if (order === 'desc') {
          this.items.sort((a, b) => (a[k] > b[k]) ? -1 : ((b[k] > a[k]) ? 1 : 0));
        }
      }
    }
  };
}