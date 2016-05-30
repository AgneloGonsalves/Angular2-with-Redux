//main entry point
import {bootstrap} from '@angular/platform-browser-dynamic';
import {App} from './src/app';
import {provideStore} from '@ngrx/store';
import {ItemsService, items, selectedItem, SiteService} from './src/items';
import {HTTP_PROVIDERS} from '@angular/http';

bootstrap(App, [
  ItemsService,
  SiteService,
  HTTP_PROVIDERS,
  provideStore({items, selectedItem})
])
.catch(err => console.error(err));
