
import MuiExpansionPanel, {ExpansionPanelProps} from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import {Theme} from '@material-ui/core/styles/createMuiTheme';
import classNames from 'classnames';
import React, {ReactNode, SyntheticEvent} from 'react';

interface AccordionProps extends ExpansionPanelProps {
  content: {heading?: string, item: ReactNode, classes?: {heading?: string, item?: string, root?: string}}[]
  btnRight?: ReactNode;
  onHeadingClick?: () => void;
  className?: string
  theme: Theme
  renderExpandIcon: (isExpanded: boolean) => ReactNode
  onAccordionChange?: (itemIndex: number, isExpanded: boolean) => void
  defaultExpandedIdx?: number
}

interface AccordionState {
  expanded: number;
}

class Accordion extends React.Component<AccordionProps, AccordionState> {
  constructor(props: AccordionProps) {
    super(props);
    this.state = {
      expanded: this.props.defaultExpandedIdx == null ? -1 : this.props.defaultExpandedIdx,
    };
  }

  public onExpandIconClick = (idx: number) => (ev: SyntheticEvent) => {
    if (this.props.onHeadingClick) {
      if (ev) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    }

    this.setState({
      expanded: this.state.expanded === idx ? -1 : idx,
    }, () => {
      if (this.props.onAccordionChange) {
        this.props.onAccordionChange(idx, this.state.expanded === idx);
      }
    });
  };

  public onPanelChange = (idx: number) => (event: React.ChangeEvent<{}>, expanded: boolean) => {
    if (this.props.onHeadingClick) {
      this.props.onHeadingClick();
      return;
    }

    this.setState({
      expanded: expanded ? idx : -1,
    });

    if (this.props.onAccordionChange) {
      this.props.onAccordionChange(idx, expanded);
    }
  };

  public render() {
    const {expanded} = this.state;

    return (
      <div className={classNames(this.props.className)}>
        {this.props.content.map(({heading, item, classes}, idx) => {
          const isExpanded = expanded === idx;
          return (
            <div key={idx}>
              <MuiThemeProvider theme={this.props.theme}>
                <MuiExpansionPanel
                  key={idx}
                  expanded={expanded === idx}
                  onChange={this.onPanelChange(idx)}
                >
                  <MuiExpansionPanelSummary
                    expandIcon={this.props.renderExpandIcon(isExpanded)}
                    disableRipple={true}
                    IconButtonProps={{onClick: this.onExpandIconClick(idx)}}
                  >
                    {heading ? <div className={expanded !== idx ? 'ellipsis' : ''}>{heading}</div> : null}
                    {this.props.btnRight && this.props.btnRight}
                  </MuiExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    {item}
                  </ExpansionPanelDetails>
                </MuiExpansionPanel>
              </MuiThemeProvider>
          </div>
          );
        })}
      </div>
    );
  }
}

export default Accordion;
