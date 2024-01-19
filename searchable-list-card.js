/*
TODO:
1. Add ability to delete items
2. Remove WS call when clearing search
*/
customElements.whenDefined('card-tools').then(() => {
    var ct = customElements.get('card-tools')

    class SearchableListCard extends ct.LitElement {

        static get properties() {
            return {
            config: {},
            hass: {},
            }
        }

        setConfig(config) {
            this.items = []
            this.results = []
            this.results_rows = []
            this.searchText = ''
            this.config = config
            this.search_text = this.config.search_text || "Type to search / add"
        }

        getCardSize() {
            return 4
        }

        render() {
            if (!this.searchText) this._getListItems()
            
            return ct.LitHtml `
                <ha-card>
                    <div id="searchContainer">
                        <div id="searchTextFieldContainer">
                            <ha-textfield
                                id="searchText"
                                @input="${this._valueChanged}"
                                @keydown=${this._addKeyPress}
                                no-label-float type="text" autocomplete="off"
                                icon iconTrailing
                                label="${this.search_text}"
                            >
                            <ha-icon icon="mdi:magnify" id="searchIcon" slot="leadingIcon"></ha-icon>
                            <ha-icon-button
                                slot="trailingIcon"
                                @click="${this._addItem}"
                                alt="Clear"
                                title="Clear"
                            >
                            <ha-icon icon="mdi:plus"></ha-icon>
                            </ha-icon-button>
                            </ha-textfield>
                        </div>
                        ${(this.results?.length > 0 && this.results?.length < this.items.length) ?
                        ct.LitHtml `<div id="count">Showing ${this.results.length - 2} of ${this.items.length} results</div>`
                        : ''}
                    </div>
                    ${(this.results_rows.length > 0) ?
                        this.results_rows
                        : ''}
                </ha-card>
            `
        }

        _addKeyPress(ev) {
            if (ev.key === "Enter") {
                this._addItem()
            }
        }

        _addItem() {
            this.items = []
            this.results = []
            this.results_rows = []
            this.hass.callService("todo", "add_item", {
                entity_id: this.config.entity,
                item: this.searchText,
            })
            .then(() => this._getListItems())
            .then(() => this._clearInput(''))
        }

        _createResultRow(item) {
            if (item == 'Active') return ct.LitHtml `<div class="header"><span>Active</span></div>`
            if (item == 'Completed') return ct.LitHtml `<div class="divider"></div><div class="header"><span>Completed</span></div>`
            if (item.status == 'completed') return ct.LitHtml `<div id="results"><ha-checkbox @change=${this._changeItemStatus} id=${item.summary} checked></ha-checkbox><label for=${item.summary}>${item.summary}</label></div>`
            return ct.LitHtml `<div id="results"><ha-checkbox @change=${this._changeItemStatus} id=${item.summary}></ha-checkbox><label for=${item.summary}>${item.summary}</label></div>`
        }

        async _getListItems() {
            return this.hass.callWS({
                type: 'todo/item/list',
                entity_id: this.config.entity
            }).then(userResponse =>
                userResponse.items).then((list_items) => {
                    this.items = list_items
                    var items = this.searchText?.length == 0 ? this.items : this.results
                    var items_done = items.filter((item) => item.status == 'completed')
                    var items_todo = items.filter((item) => item.status == 'needs_action')
        
                    var results = ['Active'].concat(items_todo.concat(['Completed'].concat(items_done)))

                    this.results_rows = results.map((item) => this._createResultRow(item))
                    return items
                })
        }

        _changeItemStatus(ev) {
            this.items = []
            this.results = []
            this.results_rows = []
            this.hass.callService("todo", "update_item", {
                entity_id: this.config.entity,
                item: ev.target.id,
                status: ev.currentTarget["__checked"] ? 'completed' : 'needs_action'
            })
            .then(() => this._getListItems())
            .then(() => this._clearInput(''))
        }

        _clearInput() {
            this.shadowRoot.getElementById('searchText').value = ''
            this._updateSearchResults('')
        }

        _valueChanged(ev) {
            var searchText = ev.target.value
            this._updateSearchResults(searchText)
        }
    
        _updateSearchResults(searchText) {
            this.results = []
            this.searchText = searchText
        
            if (!this.config || !this.hass || searchText === "") {
                this.results = this.items
                this.update()
                return
            }
        
            try {
                var searchRegex = new RegExp(searchText, 'i')
                for (var item in this.items) {
                    if (this.items[item]['summary'].search(searchRegex) >= 0) {
                        this.results.push(this.items[item])
                    }
                }
            } catch (err) {
                console.warn(err)
            }

            var items_done = this.results.filter((item) => item.status == 'completed')
            var items_todo = this.results.filter((item) => item.status == 'needs_action')

            this.results = ['Active'].concat(items_todo.concat(['Completed'].concat(items_done)))

            this.results_rows = this.results.map((item) => this._createResultRow(item))
            this.update()
        }

        static get styles() {
            return ct.LitCSS `
                #searchContainer {
                    width: 90%;
                    display: block;
                    padding-top: 15px;
                    padding-bottom: 15px;
                    margin-left: auto;
                    margin-right: auto;
                }
                #searchTextFieldContainer {
                    display: flex;
                    padding-top: 5px;
                    padding-bottom: 5px;
                }
                #searchText {
                    flex-grow: 1;
                }
                #count {
                    text-align: right;
                    font-style: italic;
                }
                #results {
                    display: block;
                    padding-bottom: 5px;
                    margin-top: 5px;
                    margin-left: auto;
                    margin-right: auto;
                    vertical-align: middle;
                }
                ha-checkbox {
                    vertical-align:middle;
                    margin-left: 15px;
                }
                label {
                    vertical-align:middle;
                }
                .divider {
                    height: 1px;
                    background-color: var(--divider-color);
                    margin: 10px 0;
                }
                .header {
                    padding-left: 30px;
                    padding-right: 16px;
                    padding-inline-start: 30px;
                    padding-inline-end: 16px;
                    padding-top: 15px;
                    padding-bottom: 15px;
                    justify-content: space-between;
                    direction: var(--direction);
                }
                .header span {
                    color: var(--primary-text-color);
                    font-weight: 500;
                }
                ha-icon {
                    color: var(--primary-text-color);
                }
            `
        }
    }
    
    customElements.define('searchable-list-card', SearchableListCard)
    
    })
    
    setTimeout(() => {
        if(customElements.get('card-tools')) return
        customElements.define('searchable-list-card', class extends HTMLElement{
        setConfig() { throw new Error("Can't find card-tools. See https://github.com/thomasloven/lovelace-card-tools")}
        })
    }, 2000)
    
    window.customCards = window.customCards || []
    window.customCards.push({
        type: "searchable-list-card",
        name: "Searchable List Card",
        preview: true,
        description: "A list card with search capabilities"
    })