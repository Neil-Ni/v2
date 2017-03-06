import _ from 'lodash';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Drawer, Navigation } from 'react-mdl';
import { translate } from 'react-i18next';
import { companyNavLinks } from 'constants/sideNavigation';
import * as paths from 'constants/paths';
import NavigationLogo from './Logo';
import SideNavigationTeamSection from './TeamSection';
import SideNavigationUserContext from './UserContext';

require('./side-navigation.scss');

function NavigationSide({
  companyUuid,
  companyName,
  currentPath,
  companyPermissions,
  teams,
  userName,
  userPhotoUrl,
  t,
}) {
  return (
    <Drawer>
      <NavigationLogo companyUuid={companyUuid} />
      <Navigation>
        {
          _.map(companyNavLinks, (link) => {
            const route = paths.getRoute(link.pathName, { companyUuid });

            // 'mdl-navigation__link' is automatically added to all links
            const className = (currentPath === route) ? 'active' : '';

            return (
              <Link
                key={link.pathName}
                className={className}
                to={route}
              >
                { t(link.translate) }
              </Link>
            );
          })
        }
      </Navigation>
      <div className="team-navigation">
        {
          _.map(teams, team =>
            <SideNavigationTeamSection
              key={team.uuid}
              companyUuid={companyUuid}
              teamUuid={team.uuid}
              name={team.name}
              color={team.color}
              currentPath={currentPath}
            />
          )
        }
      </div>
      <SideNavigationUserContext
        companyUuid={companyUuid}
        companyName={companyName}
        companyPermissions={companyPermissions}
        userName={userName}
        userPhotoUrl={userPhotoUrl}
      />
    </Drawer>
  );
}

function mapStateToProps(state) {
  const admin = _.get(state.whoami.data, 'admin', {});
  const companyPermissions = _.get(admin, 'companies') || [];
  const userData = state.user.data;
  const companyName = state.company.data.name || '';
  let teams = [];

  teams = _.map(state.teams.order, value =>
    state.teams.data[value]
  );

  return {
    currentPath: state.routing.locationBeforeTransitions.pathname,
    userName: _.get(userData, 'name', ''),
    userPhotoUrl: _.get(userData, 'photo_url', ''),
    companyName,
    companyPermissions,
    teams,
  };
}

NavigationSide.propTypes = {
  companyUuid: PropTypes.string.isRequired,
  companyName: PropTypes.string.isRequired,
  currentPath: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  userPhotoUrl: PropTypes.string.isRequired,
  companyPermissions: PropTypes.array.isRequired,
  teams: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(translate('common')(NavigationSide));
