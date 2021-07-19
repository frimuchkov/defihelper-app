import { AbstractConnector } from '@web3-react/abstract-connector'
import { ConnectorUpdate } from '@web3-react/types'
import { createDomain, guard, sample } from 'effector-logger'
import { useStore } from 'effector-react'
import { useMemo } from 'react'

import {
  augmentConnectorUpdate,
  walletApi,
  createEthereumProvider,
  connectors
} from '~/wallets/common'
import { toastsService } from '~/toasts'
import { sidUtils } from '~/users/common'
import { config } from '~/config'

const networks = new Map<
  number | undefined | string,
  typeof createEthereumProvider
>()

;[...config.CHAIN_BINANCE_IDS, ...config.CHAIN_ETHEREUM_IDS].forEach((num) =>
  networks.set(num, createEthereumProvider)
)

export const networkDomain = createDomain('network')

export const activateWalletFx = networkDomain.createEffect({
  name: 'activateWallet',
  handler: async (params: {
    connector: AbstractConnector
    update?: ConnectorUpdate<number | string>
  }) => {
    const updateData = await params.connector.activate()

    return augmentConnectorUpdate(params.connector, params.update ?? updateData)
  }
})

export const updateWalletFx = networkDomain.createEffect({
  name: 'updateWallet',
  handler: async (params: {
    connector: AbstractConnector
    update: ConnectorUpdate<number | string>
  }) => {
    return augmentConnectorUpdate(params.connector, params.update)
  }
})

export type WalletStore = ConnectorUpdate<number | string> & {
  connector?: AbstractConnector
}

export const diactivateWalletFx = networkDomain.createEffect({
  name: 'diactivateWalletFx',
  handler: async (connector?: AbstractConnector) => {
    connector?.deactivate()
  }
})

export const $wallet = networkDomain
  .createStore<WalletStore>(
    {
      chainId: config.CHAIN_ETHEREUM_IDS[0],
      account: null,
      provider: window.ethereum,
      connector: connectors.injected
    },
    {
      name: '$wallet'
    }
  )
  .on(activateWalletFx.doneData, (_, payload) => payload)
  .on(updateWalletFx.doneData, (_, payload) => payload)
  .reset(diactivateWalletFx.done)

export const getNetwork = () => {
  const wallet = $wallet.getState()

  const createProvider = networks.get(wallet.chainId)

  return {
    ...wallet,
    networkProvider: createProvider?.(wallet.provider)
  }
}

export const useNetworkProvider = () => {
  const wallet = useStore($wallet)

  return useMemo(() => {
    const createProvider = networks.get(wallet.chainId)

    return {
      ...wallet,
      networkProvider: createProvider?.(wallet.provider)
    }
  }, [wallet])
}

const MESSAGE = 'hello!'

export const signMessageFx = networkDomain.createEffect({
  name: 'signMessage',
  handler: async () => {
    const network = getNetwork()

    const signer = network.networkProvider?.getSigner()

    if (sidUtils.get() || !signer || !network.account) return

    const signature = await signer.signMessage(MESSAGE)

    if (!signature) return

    const data = await walletApi.authEth({
      network: String(network.chainId),
      signature,
      message: MESSAGE,
      address: network.account
    })

    if (!data) return

    sidUtils.set(data.sid)

    return data.user
  }
})

sample({
  source: $wallet.map(({ connector }) => connector),
  clock: signMessageFx.failData,
  target: diactivateWalletFx,
  greedy: true
})

guard({
  clock: $wallet,
  target: signMessageFx,
  filter: ({ account }) => Boolean(account),
  greedy: true
})

toastsService.forwardErrors(
  signMessageFx.failData,
  diactivateWalletFx.failData,
  updateWalletFx.failData,
  activateWalletFx.failData
)
