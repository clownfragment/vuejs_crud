/*
 * Comon props, computed, data, render function, and methods for b-pagination and b-pagination-nav
 */

import range from '../utils/range';
import { KeyCodes } from '../utils';
import { isVisible, isDisabled, selectAll, getAttr } from '../utils/dom';
import bLink from '../components/link/link';

// Make an array of N to N+X
function makePageArray(startNum, numPages) {
  return range(numPages).map(function (value, index) {
    return { number: index + startNum, className: null };
  });
}

// Threshold of limit size when we start/stop showing ellipsis
var ELLIPSIS_THRESHOLD = 3;

// Props object
var props = {
  disabled: {
    type: Boolean,
    default: false
  },
  value: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 5
  },
  size: {
    type: String,
    default: 'md'
  },
  align: {
    type: String,
    default: 'left'
  },
  hideGotoEndButtons: {
    type: Boolean,
    default: false
  },
  ariaLabel: {
    type: String,
    default: 'Pagination'
  },
  labelFirstPage: {
    type: String,
    default: 'Goto first page'
  },
  firstText: {
    type: String,
    default: '&laquo;'
  },
  labelPrevPage: {
    type: String,
    default: 'Goto previous page'
  },
  prevText: {
    type: String,
    default: '&lsaquo;'
  },
  labelNextPage: {
    type: String,
    default: 'Goto next page'
  },
  nextText: {
    type: String,
    default: '&rsaquo;'
  },
  labelLastPage: {
    type: String,
    default: 'Goto last page'
  },
  lastText: {
    type: String,
    default: '&raquo;'
  },
  labelPage: {
    type: String,
    default: 'Goto page'
  },
  hideEllipsis: {
    type: Boolean,
    default: false
  },
  ellipsisText: {
    type: String,
    default: '&hellip;'
  }
};

export default {
  components: { bLink: bLink },
  data: function data() {
    return {
      showFirstDots: false,
      showLastDots: false,
      currentPage: this.value
    };
  },

  props: props,
  render: function render(h) {
    var t = this;
    var buttons = [];

    // Factory function for prev/next/first/last buttons
    var makeEndBtns = function makeEndBtns(linkTo, ariaLabel, btnText, pageTest) {
      var button = void 0;
      pageTest = pageTest || linkTo; // Page # to test against to disable
      if (t.disabled || t.isActive(pageTest)) {
        button = h('li', {
          class: ['page-item', 'disabled'],
          attrs: { role: 'none presentation', 'aria-hidden': 'true' }
        }, [h('span', { class: ['page-link'], domProps: { innerHTML: btnText } })]);
      } else {
        button = h('li', {
          class: ['page-item'],
          attrs: { role: 'none presentation' }
        }, [h('b-link', {
          class: ['page-link'],
          props: t.linkProps(linkTo),
          attrs: {
            role: 'menuitem',
            tabindex: '-1',
            'aria-label': ariaLabel,
            'aria-controls': t.ariaControls || null
          },
          on: {
            click: function click(evt) {
              t.onClick(linkTo, evt);
            },
            keydown: function keydown(evt) {
              // Links don't normally respond to SPACE, so we add that functionality
              if (evt.keyCode === KeyCodes.SPACE) {
                evt.preventDefault();
                t.onClick(linkTo, evt);
              }
            }
          }
        }, [h('span', { attrs: { 'aria-hidden': 'true' }, domProps: { innerHTML: btnText } })])]);
      }
      return button;
    };

    // Ellipsis factory
    var makeEllipsis = function makeEllipsis() {
      return h('li', {
        class: ['page-item', 'disabled', 'd-none', 'd-sm-flex'],
        attrs: { role: 'separator' }
      }, [h('span', { class: ['page-link'], domProps: { innerHTML: t.ellipsisText } })]);
    };

    // Goto First Page button
    buttons.push(t.hideGotoEndButtons ? h(false) : makeEndBtns(1, t.labelFirstPage, t.firstText));

    // Goto Previous page button
    buttons.push(makeEndBtns(t.currentPage - 1, t.labelPrevPage, t.prevText, 1));

    // First Ellipsis Bookend
    buttons.push(t.showFirstDots ? makeEllipsis() : h(false));

    // Individual Page links
    t.pageList.forEach(function (page) {
      var inner = void 0;
      var pageNum = t.makePage(page.number);
      if (t.disabled) {
        inner = h('span', { class: ['page-link'], domProps: { innerHTML: pageNum } });
      } else {
        var active = t.isActive(page.number);
        inner = h('b-link', {
          class: t.pageLinkClasses(page),
          props: t.linkProps(page.number),
          attrs: {
            role: 'menuitemradio',
            tabindex: active ? '0' : '-1',
            'aria-controls': t.ariaControls || null,
            'aria-label': t.labelPage + ' ' + page.number,
            'aria-checked': active ? 'true' : 'false',
            'aria-posinset': page.number,
            'aria-setsize': t.numberOfPages
          },
          domProps: { innerHTML: pageNum },
          on: {
            click: function click(evt) {
              t.onClick(page.number, evt);
            },
            keydown: function keydown(evt) {
              if (evt.keyCode === KeyCodes.SPACE) {
                evt.preventDefault();
                t.onClick(page.number, evt);
              }
            }
          }
        });
      }
      buttons.push(h('li', {
        key: page.number,
        class: t.pageItemClasses(page),
        attrs: { role: 'none presentation' }
      }, [inner]));
    });

    // Last Ellipsis Bookend
    buttons.push(t.showLastDots ? makeEllipsis() : h(false));

    // Goto Next page button
    buttons.push(makeEndBtns(t.currentPage + 1, t.labelNextPage, t.nextText, t.numberOfPages));

    // Goto Last Page button
    buttons.push(t.hideGotoEndButtons ? h(false) : makeEndBtns(t.numberOfPages, t.labelLastPage, t.lastText));

    // Assemble the paginatiom buttons
    var pagination = h('ul', {
      ref: 'ul',
      class: ['pagination', 'b-pagination', t.btnSize, t.alignment],
      attrs: {
        role: 'menubar',
        'aria-disabled': t.disabled ? 'true' : 'false',
        'aria-label': t.ariaLabel || null
      },
      on: {
        keydown: function keydown(evt) {
          var keyCode = evt.keyCode;
          var shift = evt.shiftKey;
          if (keyCode === KeyCodes.LEFT) {
            evt.preventDefault();
            shift ? t.focusFirst() : t.focusPrev();
          } else if (keyCode === KeyCodes.RIGHT) {
            evt.preventDefault();
            shift ? t.focusLast() : t.focusNext();
          }
        }
      }
    }, buttons);

    // if we are pagination-nav, wrap in '<nav>' wrapper
    return t.isNav ? h('nav', {}, [pagination]) : pagination;
  },

  watch: {
    currentPage: function currentPage(newPage, oldPage) {
      if (newPage !== oldPage) {
        this.$emit('input', newPage);
      }
    },
    value: function value(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.currentPage = newValue;
      }
    }
  },
  computed: {
    btnSize: function btnSize() {
      return this.size ? 'pagination-' + this.size : '';
    },
    alignment: function alignment() {
      if (this.align === 'center') {
        return 'justify-content-center';
      } else if (this.align === 'end' || this.align === 'right') {
        return 'justify-content-end';
      }
      return '';
    },
    pageList: function pageList() {
      // Sanity checks
      if (this.currentPage > this.numberOfPages) {
        this.currentPage = this.numberOfPages;
      } else if (this.currentPage < 1) {
        this.currentPage = 1;
      }
      // - Hide first ellipsis marker
      this.showFirstDots = false;
      // - Hide last ellipsis marker
      this.showLastDots = false;
      var numLinks = this.limit;
      var startNum = 1;
      if (this.numberOfPages <= this.limit) {
        // Special Case: Less pages available than the limit of displayed pages
        numLinks = this.numberOfPages;
      } else if (this.currentPage < this.limit - 1 && this.limit > ELLIPSIS_THRESHOLD) {
        // We are near the beginning of the page list
        if (!this.hideEllipsis) {
          numLinks = this.limit - 1;
          this.showLastDots = true;
        }
      } else if (this.numberOfPages - this.currentPage + 2 < this.limit && this.limit > ELLIPSIS_THRESHOLD) {
        // We are near the end of the list
        if (!this.hideEllipsis) {
          this.showFirstDots = true;
          numLinks = this.limit - 1;
        }
        startNum = this.numberOfPages - numLinks + 1;
      } else {
        // We are somewhere in the middle of the page list
        if (this.limit > ELLIPSIS_THRESHOLD && !this.hideEllipsis) {
          this.showFirstDots = true;
          this.showLastDots = true;
          numLinks = this.limit - 2;
        }
        startNum = this.currentPage - Math.floor(numLinks / 2);
      }
      // Sanity checks
      if (startNum < 1) {
        startNum = 1;
      } else if (startNum > this.numberOfPages - numLinks) {
        startNum = this.numberOfPages - numLinks + 1;
      }
      // Generate list of page numbers
      var pages = makePageArray(startNum, numLinks);
      // We limit to a total of 3 page buttons on small screens
      // Ellipsis will also be hidden on small screens
      if (pages.length > 3) {
        var idx = this.currentPage - startNum;
        if (idx === 0) {
          // Keep leftmost 3 buttons visible
          for (var i = 3; i < pages.length; i++) {
            pages[i].className = 'd-none d-sm-flex';
          }
        } else if (idx === pages.length - 1) {
          // Keep rightmost 3 buttons visible
          for (var _i = 0; _i < pages.length - 3; _i++) {
            pages[_i].className = 'd-none d-sm-flex';
          }
        } else {
          // hide left button(s)
          for (var _i2 = 0; _i2 < idx - 1; _i2++) {
            pages[_i2].className = 'd-none d-sm-flex';
          }
          // hide right button(s)
          for (var _i3 = pages.length - 1; _i3 > idx + 1; _i3--) {
            pages[_i3].className = 'd-none d-sm-flex';
          }
        }
      }
      return pages;
    }
  },
  methods: {
    isActive: function isActive(pagenum) {
      return pagenum === this.currentPage;
    },
    pageItemClasses: function pageItemClasses(page) {
      return ['page-item', this.disabled ? 'disabled' : '', this.isActive(page.number) ? 'active' : '', page.className];
    },
    pageLinkClasses: function pageLinkClasses(page) {
      return ['page-link', this.disabled ? 'disabled' : '',
      // Interim workaround to get better focus styling of active button
      // See https://github.com/twbs/bootstrap/issues/24838
      this.isActive(page.number) ? 'btn-primary' : ''];
    },
    getButtons: function getButtons() {
      // Return only buttons that are visible
      return selectAll('a.page-link', this.$el).filter(function (btn) {
        return isVisible(btn);
      });
    },
    setBtnFocus: function setBtnFocus(btn) {
      this.$nextTick(function () {
        btn.focus();
      });
    },
    focusCurrent: function focusCurrent() {
      var _this = this;

      var btn = this.getButtons().find(function (el) {
        return parseInt(getAttr(el, 'aria-posinset'), 10) === _this.currentPage;
      });
      if (btn && btn.focus) {
        this.setBtnFocus(btn);
      } else {
        // Fallback if current page is not in button list
        this.focusFirst();
      }
    },
    focusFirst: function focusFirst() {
      var btn = this.getButtons().find(function (el) {
        return !isDisabled(el);
      });
      if (btn && btn.focus && btn !== document.activeElement) {
        this.setBtnFocus(btn);
      }
    },
    focusLast: function focusLast() {
      var btn = this.getButtons().reverse().find(function (el) {
        return !isDisabled(el);
      });
      if (btn && btn.focus && btn !== document.activeElement) {
        this.setBtnFocus(btn);
      }
    },
    focusPrev: function focusPrev() {
      var buttons = this.getButtons();
      var idx = buttons.indexOf(document.activeElement);
      if (idx > 0 && !isDisabled(buttons[idx - 1]) && buttons[idx - 1].focus) {
        this.setBtnFocus(buttons[idx - 1]);
      }
    },
    focusNext: function focusNext() {
      var buttons = this.getButtons();
      var idx = buttons.indexOf(document.activeElement);
      var cnt = buttons.length - 1;
      if (idx < cnt && !isDisabled(buttons[idx + 1]) && buttons[idx + 1].focus) {
        this.setBtnFocus(buttons[idx + 1]);
      }
    }
  }
};