import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  items = Array<{index: number, text: string, second: number}>();

  ngOnInit() {
    for (var x = 0; x < 50; x++) {
      this.items.push({index: x, text: 'item ' + x, second: Math.floor((Math.random() * 10) + 1)});
    }
  }
}
