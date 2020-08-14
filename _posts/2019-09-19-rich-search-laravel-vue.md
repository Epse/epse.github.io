---
title: Building rich search using Laravel and Vue.js
description: I set out to build a better customer search for our CRM and invoicing solution, using Laravel and Vue.js.
tags: Laravel, Vue
mirrors:
    -
        host: "Dev.to"
        url: "https://dev.to/epse/building-a-rich-search-using-laravel-and-vue-js-3732"
---

For the longest time, the in-house invoicing and CRM package where I work used [Select2](https://select2.org/) for all search boxes. The main "customer search" box had some extra code tacked on that would load the customer's profile when you selected a customer in Select2. This worked, but had a number of issues:

1. All searchable data had to be in Select2's `data` string.
2. We can only show this `data` string per customer, no extra controls, info or shortcuts.

I set out to fix this, by building a custom search solution. If you want to follow along, this isn't a tutorial but more of a guide for those familiar with Laravel. I won't tell you how to add a route, for example.

# The backend
Our managment software is written in Laravel with just a little bit of Vue sprinkled on top here and there to make this more interactive. For searching, we were already using the amazing [Eloquence](https://github.com/kirkbushell/eloquence) library. It does a lot, but most importantly it allows you to very easily add multi-column search to your models.

```php
use Sofa\Eloquence\Eloquence;

class Customer extends Model
{
    use Eloquence;
    protected $searchableColumns = [
        'first_name',
        'last_name',
        'email', 
        'address',
        'phone',
        'mobile',
    ];
    ...
}
```

That's all we need to do to our model! If you want, you can set up what fields are visible in the JSON for our model, but I'll refer you to the [Laravel documentation](https://laravel.com/docs/5.8/eloquent-serialization) for that.

Now we need to add a controller method to handle search, and figure out what the api will look like. Our old search API will still be used in quite a few places, so we can't use `/customers/find?q=<querystring>`. Instead, I went with `/customers/findRich?q=<querystring>`. Let's add that route and point it to a new controller method. This method turned out to be ridiculously simple:

```php
public function findRich(Request $request)
{
    $term = trim($request->q);
    if (empty($term))
        return response()->json([]);

    $customers = Customer::search($term)
    ->limit(self::SEARCH_LIMIT)->get();

    // This should do automatic and nice JSON
    return $customers;
}
```

That's it!

# URL's
I wanted our frontend to be able to get the URL for a `Customer`, as well as the URL to make a new `Repair` or `Quote` for that customer to show in the frontend. I decided to add properties for that to the `Customer` model and include them in the JSON, like so:
```php
protected $appends = ['url'];
public function getUrlAttribute()
{
    return url()->route('customers.show', $this);
}
```
The `$appends` variable can be used to add non-column properties to the serialized version of a model. Be sure to add the same properties to `$visible` as well, if you use it. Otherwise, they still won't show up in the JSON.

# Front-end
In the side-bar of every view, I simply included a text input:
```html
<input type="text" id="main-customer-search"
    v-model="customerSearchTerm" placeholder="Search for customers..." />
```

The `id` is used for our sidewide keyboard-shortcut system, if you are wondering.

I added `customerSearchTerm` to the main `Vue` instance's `data` object, but that's it. Our main instance does nothing, it just registers some external components and passes some data between those components. It doesn't even have a single method!

All my components are vue single-file components, but my styling is done in a separate `SCSS` file, to hook into our Bootstrap variables and theming. The template turned out quite simple
```html
<template>
    <div v-if="visible" id="customer-search-popover">
        <div class="customer-search-modal-header modal-header">
            <h5 class="modal-title">Search results</h5>
            <button type="button" class="close" v-on:click="dismiss" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <table class="table table-sm table-hover">
            <thead>
                <th scope="col">Customer</th>
                <th scope="col">Phone</th>
                <th scope="col">Mobile</th>
                <th scope="col">E-mail</th>
                <th scope="col">Actions</th>
                <th scope="col"></th>
            </thead>
            <tbody>
                <tr v-for="customer in customers" v-bind:key="customer.id">
                    <th class="align-middle" scope="row">{{ customer.name }}</th>
                    <td class="align-middle">{{ customer.formatted_phone }}</td>
                    <td class="align-middle">{{ customer.formatted_mobile }}</td>
                    <td class="align-middle"><a :href="'mailto:' + customer.email">{{ customer.email }}</a></td>
                    <td class="align-middle">
                        <a class="btn btn-outline-primary" :href="customer.url">View</a>
                    </td>
                    <td class="align-middle">
                        <a class="btn btn-outline-secondary" :href="customer.quick_repair_url">Repair</a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
```
You can see we are using the `url` properties added earlier. I used a mix of bootstrap and own classes here, the `SCSS` ended up looking like this:
```scss
#customer-search-popover {
    position: absolute;
    width: 100%;
    min-height: 5rem;
    z-index: 1000;
    padding: 1rem;
    background-color: $white;
    box-shadow: $box-shadow-lg;
    border: 1px solid $orange;
    @include border-radius($modal-content-border-radius);
}

.customer-search-modal-header {
    background-color: $orange;
    color: $white;
    margin-top: -1rem;
    margin-left: -1rem;
    margin-right: -1rem;
    margin-bottom: $spacer;
    border-radius: 0;
}
```
This is nothing fancy at all, just setting up a modal window with a drop shadow and a header.

The Javascript code is nothing fancy either, I believe in plain and simple. The modal should be visible if we have search results and the user hasn't clicked the close button, and if the prop that passes in a search term gets changed, we call a debounced function to fetch a new set of search results from the API we made earlier. That ends up lookiing like this:
```js
 import { debounce, headers } from '../util.js';
 export default {
     props: {
         'searchTerm': {type: String},
         'searchUrl': {required: true, type: String},
         'csrf': {required: true, type: String},
     },
     data() {
         return {
             customers: [],
             hide: false,
         };
     },
     methods: {
         dismiss: function () {
             this.hide = true;
         },
     },
     computed: {
         visible: function() {
             return !this.hide && this.customers && this.customers.length;
         }
     },
     watch: {
         'searchTerm': debounce(function (val, old) {
             this.hide = false;
             fetch(this.searchUrl + '?q=' + encodeURI(this.searchTerm), {
                 headers: headers,
             }).then(res => {
                 if (!res.ok)
                     res.text().then(res => console.error(res));
                 else
                     res.json().then(res => this.customers = res);
             });
         }, 100, false),
     },
 };
```

The `debounce` function I imported here is not my own invention, I ~~stole~~ took inspiration from some other blog for it. It just takes a function, a timeout and the third parameter can be used to force the execution of the function. `headers` is just a set of headers that I use all throughout the front-end so I split it out. Gotta keep DRY.

I hope this was of any use for anyone! Cheers!


