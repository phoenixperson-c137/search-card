# Searchable List Card

Forked from [postlund](https://github.com/postlund)'s [search-card](https://github.com/postlund/search-card)
A Todo List card with search capabilities.
This is a very early version, done very quick and dirty.
Please add your improvement suggestions, and feel free to contribute.

<!-- ![Demo of card](images/demo.gif) -->

## Features

* The Add item textfield is now also a search bar
* Helps find existing items and avoid creating duplicates

## Roadmap

Some things I want to add in upcoming releases:

* Add ability to edit / delete items
* Improve performance

## Install
  
Make sure [card-tools](https://github.com/thomasloven/lovelace-card-tools) is installed first.
  
### Simple Install

1. Download `search-card.js` and copy it into `config/www/search-card` (create the `search-card` directory)

2. Add a reference to `search-card/search-card.js` inside your `ui-lovelace.yaml`

  ```yaml
  resources:
    - url: /local/search-card/search-card.js?v=0
      type: module
  ```

### Git Install

1. Clone this repository into your `www`-directory: `git clone https://github.com/postlund/search-card.git`

2. Add a reference to `search-card/search-card.js` inside your `ui-lovelace.yaml`

  ```yaml
  resources:
    - url: /local/search-card/search-card.js?v=0
      type: module
  ```

## HACS

Look for `Search Card` in the store.

## Updating

If you...

* manually copied the files, just download the latest files and overwrite what you already have
* cloned the repository from Github, just do `git pull` to update

... and increase `?v=X` to `?vX+1`.

## Using the card

### Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| max_results | integer | 10 | Max results to show by default
| actions | Object | optional | Custom defined actions
| search_text | String | "Type to search..." | Override of placeholder text
| included_domains | Array of String | optional | Only show entities from defined domains. Cannot be set together with `excluded_domains`.
| excluded_domains | Array of String | optional | Don't show entities from defined domains. Cannot be set together with `included_domains`.

### Actions

You can define custom actions that will call a service (if it exists) with the input. Matching is done via regular expressions and {1}, {2}, {3}, etc. will be replaced by the corresponding group. See example below for inspiration.

### Example

  ```yaml
    type: custom:search-card
    max_results: 10
    actions:
      - matches: '^toggle (.+\..+)'
        name: 'Toggle {1}'
        service: homeassistant.toggle
        service_data:
        entity_id: {1}
    excluded_domains:
      - automation
  ```

## Issues and imitations

This is still an early version and may contain bugs. If you find any problems, please write an issue.

## Getting errors?

Clear the browser cache, restart Home Assistant and make sure the configuration is correct. Also make sure [card-tools](https://github.com/thomasloven/lovelace-card-tools) is installed properly.

If you believe you have found an error, please write an issue.
