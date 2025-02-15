const explorers: Record<string | number, string> = {
  1: 'https://etherscan.io/address',
  waves: 'https://wavesexplorer.com/address'
}

type Options = {
  network: string | number
  address: string
}

export const buildExplorerUrl = (options: Options) =>
  [explorers[options.network], options.address].join('/')
