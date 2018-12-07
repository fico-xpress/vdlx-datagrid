export default class Paginator {

    constructor(table) {

        this.table = table;
        if(table) {
            // this.currentPage = table.getPage();
            // this.maxPage = table.getPageMax();
            // this.pageSize = table.getPageSize();
        }

        this.$paginationControl = $(`<div class="datagrid-pagination-control">
    <div class="pull-right">
        <div class="paging_fico">
            <button class="reveal-btn btn"><span class="paginate-control-text">page 1 of 1 </span><i class="fico-arrow-down5"></i>
            </button>
            <ul class="pager jumpto-pager">
                <li><a class="pagination-button-previous disabled"><i class="fico-chevron-left"></i></a></li>
                <li><a class="pagination-button-next"><i class="fico-chevron-right"></i></a></li>
            </ul>
            <div class="jumpto-pagination hide">
                <div>
                    <div class="jumpto-pagination-label">Jump to page:</div>
                    <input type="number" class="jumpto-pagination-input" value="1"></div>
                <div class="results-per-page">
                    <div class="jumpto-pagination-label">Items per page:</div>
                    <select class="results-per-page-selector">
                        <option value="5">5</option>
                        <option value="10" selected>10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
<!--                        <option value="-1">All</option>-->
                    </select></div>
            </div>
        </div>
    </div>
</div>`);

    }

    /*
    Tabulator Pagination methods

    table.setPage(5);
    table.nextPage();
    table.previousPage();
    table.setPageSize(50);
    var pageSize = table.getPageSize();
    table.getPage();
    table.getPageMax();

     */

    get currentPage() {
        return this.table.getPage();
    }

    set currentPage(num) {
        return this.table.setPage(num);
    }

    get maxPage() {
        return this.table.getPageMax();
    }

    updatePageIndicators() {
        let pageNum = this.currentPage;
        this.$pageInput.val(pageNum);
        if(pageNum === 1) {
            this.$prevBtn.addClass('disabled');
        } else {
            this.$prevBtn.removeClass('disabled');
        }
        if(pageNum === this.maxPage) {
            this.$nextBtn.addClass('disabled');
        } else {
            this.$nextBtn.removeClass('disabled');
        }
        this.$pageNumbersSpan.text(`Page ${this.currentPage} of ${this.maxPage}`);
    }

    previousPage() {
        if(this.currentPage > 1) {
            this.table.previousPage();
            this.updatePageIndicators();
        }
    }

    nextPage() {
        if(this.currentPage < this.maxPage) {
            this.table.nextPage();
            this.updatePageIndicators();
        }
    }

    goToPage(pageNum) {
        let currentPage = Math.max(1, Math.min(this.maxPage, pageNum));
        this.currentPage = currentPage;

        return currentPage;
    }

    appendTo($container) {
        $container.append(this.$paginationControl);

        this.$revealBtn = this.$paginationControl.find('.paging_fico .reveal-btn');
        this.$dropdown = this.$paginationControl.find('.paging_fico .jumpto-pagination');
        this.$prevBtn = this.$paginationControl.find('.pagination-button-previous');
        this.$nextBtn = this.$paginationControl.find('.pagination-button-next');
        this.$pageInput = this.$paginationControl.find('.paging_fico .jumpto-pagination-input');
        this.$perPageSelector = this.$paginationControl.find('.results-per-page-selector');
        this.$pageNumbersSpan = this.$paginationControl.find('.paginate-control-text');

        this.$revealBtn.on('mousedown', () => {
            this.$revealBtn.toggleClass('active-pager-btn');
            this.$dropdown.toggleClass('hide');
        });

        this.$prevBtn.on('mouseup', () => {
            this.previousPage();
        });

        this.$nextBtn.on('mouseup', () => {
            this.nextPage();
        });

        this.$pageInput.on('input', evt => {
            let val = _.parseInt(evt.target.value);
            if(_.isNumber(val)) {
                let actual = this.goToPage(val);
                if(actual !== val) {
                    this.updatePageIndicators();
                }
            }
        });

        this.$perPageSelector.on('input', evt => {
            let val = _.parseInt(evt.target.value);
            this.table.setPageSize(val);
            this.updatePageIndicators();
        });

        _.defer(()=> {
            this.updatePageIndicators();
        });
    }
}