import Input from '@material-ui/core/Input';
import Radio from '@material-ui/core/Radio';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import filter from 'lodash-es/filter';
import isEqual from 'lodash-es/isEqual';
import pick from 'lodash-es/pick';
import reduce from 'lodash-es/reduce';
import uniq from 'lodash-es/uniq';
import React, {Component} from 'react';

import AddField from '@io-app/components/common/AddField';
import {IAssetInterface, IBands} from '@io-app/types/IBands';
import {STRING_RESOURCES} from '@io-app/utils/string-resources';
import {baseTheme} from '@io-ui/Themes';
import './styles.scss';

export interface IBandsEditorProps {
  onChange: (b: IBands) => void
  bands: IBands
  errors: any
}

export interface IBandsEditorState {
  interfaces: IAssetInterface[]
  current: (number | null)[]
  memoizeBands: IBands
}

export default class BandsEditor extends Component<IBandsEditorProps, IBandsEditorState> {
  constructor(props: IBandsEditorProps) {
    super(props);
    this.state = {
      interfaces: this.props.bands.interfaces,
      current: this.props.bands.current,
      memoizeBands: this.props.bands,
    };
  }

  static getDerivedStateFromProps(nextProps: IBandsEditorProps, prevState: IBandsEditorState) {
    return (
      !isEqual(nextProps.bands.current, prevState.memoizeBands.current) ||
      !isEqual(nextProps.bands.interfaces, prevState.memoizeBands.interfaces)
    ) ? {
      interfaces: nextProps.bands.interfaces,
      current: nextProps.bands.current,
      memoizeBands: pick(nextProps.bands, ['current', 'interfaces']),
    } : null;
  }

  public changeRadioHandler = (e: any) => {
    if (!(e && e.target)) {
      return;
    }
    this._setStateAndThrowOnchange({
      current: this.state.current.map((c, i) => i === Number(e.target.name) ? Number(e.target.value) : Number(c)),
    });
  }

  public changeInterfaceName = (idx: number, value: any) => this._updateInterfaceProp('name', idx, value);
  public changeInterfaceIP = (idx: number, value: any) => this._updateInterfaceProp('ip', idx, value);

  public removeInterface = (interfaceIdxToRemove: number) => {
    const interfaces = filter(this.state.interfaces, (i, idx) => idx !== interfaceIdxToRemove);
    const current = this.state.current
      // nulling items where was used deleted interface
      .map((c) => c === interfaceIdxToRemove ? null : c)
      // shift up items if not last interface was removed
      .map((c) => (interfaceIdxToRemove !== interfaces.length && c) ? c - 1 : c);
    return this._setStateAndThrowOnchange({interfaces, current});
  };

  public addInterface = (interfaceName: string) => this._setStateAndThrowOnchange({
    interfaces: [
      ...this.state.interfaces,
      {name: interfaceName, ip: '', id: null, protocol: 1},
    ],
  });

  public renderErrorsRow = () => {
    const {errors} = this.props;
    if (!errors) return null;
    const errorsList = uniq(reduce(errors, (acc: any, err) => {
      (typeof err === 'string')
        ? acc.push(err)
        : err.map((e: any) => {
          (e && e.name) && acc.push(e.name);
          (e && e.ip) && acc.push(e.ip);
        });
      return acc;
    }, []));
    return errorsList.map((e, i) => (
      <p className="bands-editor__error-row" key={`bands-editor__error-row-${i}`}>{e}</p>
    ));
  };

  render() {
    const {interfaces, current} = this.state;
    return (
      <MuiThemeProvider theme={baseTheme}>
        <div className="bands-editor">
          <div className="bands-editor__add-container">
            <AddField
              onSubmit={this.addInterface}
              title={STRING_RESOURCES.band_editor.add_interface}
              placeholder={STRING_RESOURCES.band_editor.enter_interface_name}
            />
          </div>
          <Table>
            <TableHead>
              <TableRow>
                {['Interface', 'Channel', 'Band 1', 'Band 2', 'App', ''].map((colTitle, i) => (
                  <TableCell key={`${colTitle}-${i}`}>{colTitle}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {
                this.state.interfaces.map((bandInterface, idx) => (
                  <TableRow key={`$bands-editor-row-${idx}`}>
                    <TableCell>
                      <Input
                        value={interfaces[idx].name || ''}
                        name={String(idx)}
                        error={interfaces[idx].name === ''}
                        disableUnderline={true}
                        onChange={e => this.changeInterfaceName(idx, e.target.value.trim())}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={interfaces[idx].ip || ''}
                        disableUnderline={true}
                        name={String(idx)}
                        onChange={e => this.changeInterfaceIP(idx, e.target.value.trim())}
                      />
                    </TableCell>
                    {
                      current.map((band, j) => (
                        <TableCell key={`cell-band-${j}`}>
                          <Radio
                            checked={current[j] === idx}
                            onChange={this.changeRadioHandler}
                            value={String(idx)}
                            name={String(j)}
                            aria-label={String(j)}
                          />
                        </TableCell>
                      ))
                    }
                    <TableCell>
                      <Tooltip title={STRING_RESOURCES.band_editor.delete_interface(bandInterface.name)}>
                        <button
                          aria-label={name}
                          onClick={() => this.removeInterface(idx)}
                          className="io-icon delete"
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
          {this.renderErrorsRow()}
        </div>
      </MuiThemeProvider>
    );
  }

  private _updateInterfaceProp<T>(prop: string, idx: number, value: T) {
    const oldInterfaces = this.state.interfaces;
    this._setStateAndThrowOnchange({
      interfaces: [
        ...oldInterfaces.slice(0, idx),
        {...oldInterfaces[idx], [prop]: value},
        ...oldInterfaces.slice(idx + 1),
      ],
    });
  }

  private _setStateAndThrowOnchange(stateUpdate: Partial<IBands>) {
    return this.setState(
      {...this.state, ...stateUpdate},
      () => this.props.onChange(pick(this.state, ['current', 'interfaces']) as IBands),
    );
  }
}
