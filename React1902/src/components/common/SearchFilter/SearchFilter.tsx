
/**
 * @fileOverview Search Filter
 */

import classNames from 'classnames';
import debounce from 'lodash-es/debounce';
import get from 'lodash-es/get';
import React, {Component} from 'react';

import {SearchControl} from '@io-app/components/ui/Filters/FilterControl';
import {stopEvent} from '@io-app/utils/browser';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';

interface SearchFilterState {
  value: string
}

interface SearchFilterProps<T> {
  filter: T
  apply: (filter: T) => void
  placeholder?: string
  className?: string
  entityKey: keyof T
  controlKey?: string
  entityType: string
}

class SearchFilter<T> extends Component<SearchFilterProps<T>, SearchFilterState> {
  constructor(props: SearchFilterProps<T>) {
    super(props);
    this.state = {
      value: get(this.props.filter, this.props.entityKey, ''),
    };
    this.debouncedApplyFilter = debounce(this._apply, 500);
  }

  public applyCurrentFilter = stopEvent(() => {
    this._apply(this.props.filter, this.state.value);
  });

  public debouncedApplyFilter: (filter: T, value: Maybe<string>) => void;

  public handleSearchKeyChange = stopEvent((e) => {
    const value = e ? e.target.value : null;
    this.setState({value});
    if (!value || value.length >= 3) {
      this.debouncedApplyFilter(this.props.filter, value);
    }
  });

  public componentDidUpdate(prevProps: Readonly<SearchFilterProps<T>>, prevState: Readonly<SearchFilterState>, snapshot?: any): void {
    if (prevProps.entityType !== this.props.entityType) {
      this.setState({value: get(this.props.filter, this.props.entityKey, '')});
    }
  }

  public render() {
    return (
      <div className={classNames('search-filter', this.props.className)}>
        <SearchControl
          value={this.state.value}
          placeholder={this.props.placeholder || STRING_RESOURCES.common.search}
          onChange={this.handleSearchKeyChange}
          clear={this.handleSearchKeyChange}
          apply={this.applyCurrentFilter}
        />
      </div>
    );
  }

  private _apply(filter: T, value: Maybe<string>) {
    this.props.apply({
      ...(filter as any),
      [this.props.entityKey]: value && value.length >= 3 ? value : null,
    });
  }
}

export default SearchFilter;
