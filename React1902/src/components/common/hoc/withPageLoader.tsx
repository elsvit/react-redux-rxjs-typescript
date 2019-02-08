/**
 * @fileOverview withPageLoader HOC
 */

import React, {Component, ComponentType} from 'react';

import PageHeader from '@io-app/components/common/AppPage/PageHeader';
import PageLoader from '@io-app/components/common/PageLoader';

function withPageLoader<P extends {isInitialized: boolean}>(title?: string) {
  return function (WrappedComponent: ComponentType<P>) {
    return class extends Component<P> {
      public render() {
        if (!this.props.isInitialized) {
          return (
            <>
              {title && <PageHeader title={title}/>}
              <PageLoader/>
            </>
          );
        }

        return <WrappedComponent {...this.props}/>;
      }
    };
  };
}

export default withPageLoader;
