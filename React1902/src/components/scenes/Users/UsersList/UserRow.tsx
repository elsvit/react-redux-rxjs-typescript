/**
 * @fileOverview Users List Row
 */

import Paper from '@material-ui/core/Paper';
import compact from 'lodash-es/compact';
import React, {Component} from 'react';

import {IUser} from '@io-app/types/IUser';

interface IUserRowProps {
  user: IUser
  edit: ({id}: {id: string}) => void
}

class UserRow extends Component<IUserRowProps> {
  public edit = () => {
    this.props.edit(this.props.user);
  }

  public render() {
    const {name, lastName} = this.props.user;
    const nameOutput = compact([name, lastName]).join(' ');
    return (
      <Paper className="user-row cursor-pointer ellipsis" elevation={1} onClick={this.edit}>
        {nameOutput}
      </Paper>
    );
  }
}

export default UserRow;

