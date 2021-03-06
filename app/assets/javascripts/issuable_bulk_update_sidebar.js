/* eslint-disable class-methods-use-this, no-new */
/* global LabelsSelect */
/* global MilestoneSelect */
/* global IssueStatusSelect */
/* global SubscriptionSelect */

import IssuableBulkUpdateActions from './issuable_bulk_update_actions';

const HIDDEN_CLASS = 'hidden';
const DISABLED_CONTENT_CLASS = 'disabled-content';
const SIDEBAR_EXPANDED_CLASS = 'right-sidebar-expanded issuable-bulk-update-sidebar';
const SIDEBAR_COLLAPSED_CLASS = 'right-sidebar-collapsed issuable-bulk-update-sidebar';

export default class IssuableBulkUpdateSidebar {
  constructor() {
    this.initDomElements();
    this.bindEvents();
    this.initDropdowns();
    this.setupBulkUpdateActions();
  }

  initDomElements() {
    this.$page = $('.page-with-sidebar');
    this.$sidebar = $('.right-sidebar');
    this.$sidebarInnerContainer = this.$sidebar.find('.issuable-sidebar');
    this.$bulkEditCancelBtn = $('.js-bulk-update-menu-hide');
    this.$bulkEditSubmitBtn = $('.update-selected-issues');
    this.$bulkUpdateEnableBtn = $('.js-bulk-update-toggle');
    this.$otherFilters = $('.issues-other-filters');
    this.$checkAllContainer = $('.check-all-holder');
    this.$issueChecks = $('.issue-check');
    this.$issuesList = $('.selected_issue');
    this.$issuableIdsInput = $('#update_issuable_ids');
  }

  bindEvents() {
    this.$bulkUpdateEnableBtn.on('click', e => this.toggleBulkEdit(e, true));
    this.$bulkEditCancelBtn.on('click', e => this.toggleBulkEdit(e, false));
    this.$checkAllContainer.on('click', e => this.selectAll(e));
    this.$issuesList.on('change', () => this.updateFormState());
    this.$bulkEditSubmitBtn.on('click', () => this.prepForSubmit());
    this.$checkAllContainer.on('click', () => this.updateFormState());
  }

  initDropdowns() {
    new LabelsSelect();
    new MilestoneSelect();
    new IssueStatusSelect();
    new SubscriptionSelect();
  }

  getNavHeight() {
    const navbarHeight = $('.navbar-gitlab').outerHeight();
    const layoutNavHeight = $('.layout-nav').outerHeight();
    const subNavScroll = $('.sub-nav-scroll').outerHeight();
    return navbarHeight + layoutNavHeight + subNavScroll;
  }

  initSidebar() {
    if (!this.navHeight) {
      this.navHeight = this.getNavHeight();
    }

    if (!this.sidebarInitialized) {
      $(document).off('scroll').on('scroll', _.throttle(this.setSidebarHeight, 10).bind(this));
      $(window).off('resize').on('resize', _.throttle(this.setSidebarHeight, 10).bind(this));
      this.sidebarInitialized = true;
    }
  }

  setupBulkUpdateActions() {
    IssuableBulkUpdateActions.setOriginalDropdownData();
  }

  updateFormState() {
    const noCheckedIssues = !$('.selected_issue:checked').length;

    this.toggleSubmitButtonDisabled(noCheckedIssues);
    this.updateSelectedIssuableIds();

    IssuableBulkUpdateActions.setOriginalDropdownData();
  }

  prepForSubmit() {
    // if submit button is disabled, submission is blocked. This ensures we disable after
    // form submission is carried out
    setTimeout(() => this.$bulkEditSubmitBtn.disable());
    this.updateSelectedIssuableIds();
  }

  toggleBulkEdit(e, enable) {
    e.preventDefault();

    this.toggleSidebarDisplay(enable);
    this.toggleBulkEditButtonDisabled(enable);
    this.toggleOtherFiltersDisabled(enable);
    this.toggleCheckboxDisplay(enable);

    if (enable) {
      this.initSidebar();
    }
  }

  updateSelectedIssuableIds() {
    this.$issuableIdsInput.val(IssuableBulkUpdateSidebar.getCheckedIssueIds());
  }

  selectAll() {
    const checkAllButtonState = this.$checkAllContainer.find('input').prop('checked');

    this.$issuesList.prop('checked', checkAllButtonState);
  }

  toggleSidebarDisplay(show) {
    this.$page.toggleClass(SIDEBAR_EXPANDED_CLASS, show);
    this.$page.toggleClass(SIDEBAR_COLLAPSED_CLASS, !show);
    this.$sidebarInnerContainer.toggleClass(HIDDEN_CLASS, !show);
    this.$sidebar.toggleClass(SIDEBAR_EXPANDED_CLASS, show);
    this.$sidebar.toggleClass(SIDEBAR_COLLAPSED_CLASS, !show);
  }

  toggleBulkEditButtonDisabled(disable) {
    if (disable) {
      this.$bulkUpdateEnableBtn.disable();
    } else {
      this.$bulkUpdateEnableBtn.enable();
    }
  }

  toggleCheckboxDisplay(show) {
    this.$checkAllContainer.toggleClass(HIDDEN_CLASS, !show);
    this.$issueChecks.toggleClass(HIDDEN_CLASS, !show);
  }

  toggleOtherFiltersDisabled(disable) {
    this.$otherFilters.toggleClass(DISABLED_CONTENT_CLASS, disable);
  }

  toggleSubmitButtonDisabled(disable) {
    if (disable) {
      this.$bulkEditSubmitBtn.disable();
    } else {
      this.$bulkEditSubmitBtn.enable();
    }
  }
  // loosely based on method of the same name in right_sidebar.js
  setSidebarHeight() {
    const currentScrollDepth = window.pageYOffset || 0;
    const diff = this.navHeight - currentScrollDepth;

    if (diff > 0) {
      this.$sidebar.outerHeight(window.innerHeight - diff);
    } else {
      this.$sidebar.outerHeight('100%');
    }
  }

  static getCheckedIssueIds() {
    const $checkedIssues = $('.selected_issue:checked');

    if ($checkedIssues.length > 0) {
      return $.map($checkedIssues, value => $(value).data('id'));
    }

    return [];
  }
}
