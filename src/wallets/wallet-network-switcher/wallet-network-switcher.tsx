import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { useState } from 'react'
import { useStore } from 'effector-react'

import { useDialog } from '~/common/dialog'
import { ChangeNetworkDialog } from '~/common/change-network-dialog'
import { setupBinance } from '~/common/setup-network'
import { useAbility } from '~/users'
import { Network, NETWORKS } from '~/wallets/common'
import * as model from './wallet-network-switcher.model'

export type WalletNetworkSwitcherProps = {
  className?: string
}

const noop = () => {
  return new Promise((r) => r(undefined))
}

export const WalletNetworkSwitcher: React.VFC<WalletNetworkSwitcherProps> =
  () => {
    const ability = useAbility()

    const currentNetwork = useStore(model.$currentNetwork)

    const [anchorEl, setAnchorEl] = useState<
      (EventTarget & HTMLButtonElement) | null
    >(null)

    const [openChangeNetwork] = useDialog(ChangeNetworkDialog)

    const handlers: Record<string, () => Promise<unknown>> = {
      openChangeNetwork,
      setupBinance,
      loginWaves: noop
    }

    const handleChangeNetwork = (networkItem: Network) => () => {
      if (!networkItem.onClick) return

      const changeNetwork = handlers[networkItem.onClick]

      if (changeNetwork) {
        changeNetwork()
          .then(() => model.activateNetwork(networkItem))
          .catch(console.error)
      }
    }

    const handleClose = () => {
      setAnchorEl(null)
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget)
    }

    return (
      <>
        <Button
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleClick}
          color="inherit"
        >
          {currentNetwork.title}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {NETWORKS.filter((networkItem) =>
            ability.can('read', networkItem.type)
          ).map((networkItem) => (
            <MenuItem
              key={networkItem.title}
              button
              onClick={handleChangeNetwork(networkItem)}
            >
              {networkItem.title}
            </MenuItem>
          ))}
        </Menu>
      </>
    )
  }
