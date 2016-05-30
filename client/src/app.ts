import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {ItemsService, Item, AppStore, Site, SiteService} from './items';
import {Observable} from 'rxjs/Observable';
import {Store} from '@ngrx/store';

//-------------------------------------------------------------------
// ITEMS-LIST
//-------------------------------------------------------------------
@Component({
  selector: 'items-list',
  template: `
  <div *ngFor="let item of items" (click)="selected.emit(item)"
    class="item-card mdl-card mdl-shadow--2dp">
    <div class="mdl-card__title">
      <h2 class="mdl-card__title-text">{{item.name}}</h2>
    </div>
    <div class="mdl-card__supporting-text">
      {{item.description}}
    </div>
    <div class="mdl-card__menu">
      <button (click)="deleted.emit(item); $event.stopPropagation();"
        class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
        <i class="material-icons">close</i>
      </button>
    </div>
  </div>
  `
})
class ItemList {
  @Input() items: Item[];
  @Output() selected = new EventEmitter();
  @Output() deleted = new EventEmitter();
}

//-------------------------------------------------------------------
// ITEM DETAIL
//-------------------------------------------------------------------
@Component({
  selector: 'item-detail',
  template: `
  <div class="item-card mdl-card mdl-shadow--2dp">
    <div class="mdl-card__title">
      <h2 class="mdl-card__title-text" *ngIf="selectedItem.id">Editing {{originalName}}</h2>
      <h2 class="mdl-card__title-text" *ngIf="!selectedItem.id">Create New Site</h2>
    </div>
    <div class="mdl-card__supporting-text">
      <form novalidate>
          <div class="mdl-textfield mdl-js-textfield">
            <label>Site Name</label>
            <input [(ngModel)]="selectedItem.name"
              placeholder="Enter a name"
              class="mdl-textfield__input" type="text">
          </div>

          <div class="mdl-textfield mdl-js-textfield">
            <label>Site Description</label>
            <input [(ngModel)]="selectedItem.description"
              placeholder="Enter a description"
              class="mdl-textfield__input" type="text">
          </div>
      </form>
    </div>
    <div class="mdl-card__actions">
        <button type="submit" (click)="cancelled.emit(selectedItem)"
          class="mdl-button mdl-js-button mdl-js-ripple-effect">Cancel</button>
        <button type="submit" (click)="saved.emit(selectedItem)"
          class="mdl-button mdl-js-button mdl-button--colored mdl-js-ripple-effect">Save</button>
    </div>
  </div>
  `
})
class ItemDetail {
  @Input('item') _item: Item;
  originalName: string;
  selectedItem: Item;
  @Output() saved = new EventEmitter();
  @Output() cancelled = new EventEmitter();

  set _item(value: Item){
    if (value) this.originalName = value.name;
	  this.selectedItem = (<any>Object).assign({}, value);
  }
}

@Component({
  selector: 'track-sites',
  template: `
  <article class="template animated slideInRight">
  <h4>My Sites</h4>

  

      <table  class="table table-striped">
          <thead>
              <tr>
                  <th>Id</th>
                  <th>Name</th>
                  <!--<th>Stage</th>-->
                  <th>Description</th>
              </tr>
          </thead>
          <tbody>
              <tr *ngFor="let site of filteredSites" classname="">
                  <td>{{site.id}}</td>
                  <td>{{site.name}}</td>
                  <!--<td>{{site.stage}}</td>-->
                  <td>{{site.description}}</td>
              </tr>
          </tbody>
        </table>
</article>
  `
  //styleUrls: ['./app/sites/site-list.component.css']
  //pipes: [SortSitesPipe]
})
export class SiteListComponent {
  //private _dbResetSubscription: Subscription;
  @Input() filteredSites: Site[];

  constructor(private _siteService: SiteService) { }

  // filterChanged(searchText: string) {
  //     this.filteredSites = this._filterService.filter(searchText, ['name', 'location', 'stage', 'description'], this.sites);
  // }

}

//-------------------------------------------------------------------
// MAIN COMPONENT
//-------------------------------------------------------------------
@Component({
  selector: 'my-app',
  providers: [],
  template: `
  <div class="mdl-cell mdl-cell--12-col">
    <item-detail
      (saved)="saveItem($event)" (cancelled)="resetItem($event)"
      [item]="selectedItem | async">Select an Item</item-detail>
  </div>
  <div class="mdl-cell mdl-cell--12-col">
    <items-list [items]="items | async"
      (selected)="selectItem($event)" (deleted)="deleteItem($event)">
    </items-list>
  </div>
  <div>
        <!--<filter-text (changed)="filterChanged($event)"></filter-text>-->
        
        <!--<track-sites [filteredSites]="sites | async"></track-sites>-->
   </div>
  `,
  directives: [ItemList, ItemDetail, SiteListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  items: Observable<Array<Item>>;
  selectedItem: Observable<Item>;
  sites: Observable<Array<Site>>;

  constructor(private itemsService: ItemsService, private siteService: SiteService, private store: Store<AppStore>) {

  }

  ngOnInit() {
    this.items = this.itemsService.items;
    this.selectedItem = this.store.select('selectedItem');
    this.selectedItem.subscribe(v => console.log(v));

    this.itemsService.loadItems();
    
    this.sites = this.siteService.loadedItems;
    this.siteService.loadSites();
  }

  resetItem() {
    let emptyItem: Item = {id: null, name: '', description: ''};
    this.store.dispatch({type: 'SELECT_ITEM', payload: emptyItem});
  }

  selectItem(item: Item) {
    this.store.dispatch({type: 'SELECT_ITEM', payload: item});
  }

  saveItem(item: Item) {
    this.itemsService.saveItem(item);

    // Generally, we would want to wait for the result of `itemsService.saveItem`
    // before resetting the current item.
    this.resetItem();
  }

  deleteItem(item: Item) {
    this.itemsService.deleteItem(item);

    // Generally, we would want to wait for the result of `itemsService.deleteItem`
    // before resetting the current item.
    this.resetItem();
  }
}
