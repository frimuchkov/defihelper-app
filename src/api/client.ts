import { createClient } from '@urql/core'
import memoize from 'fast-memoize'
import { sidUtils } from '~/common/sid-utils'

import { config } from '~/config'

const ERROR_MESSAGE = 'API_URL is required'

export const getAPIClient = memoize(() => {
  const url = config.API_URL

  if (!url) {
    throw new Error(ERROR_MESSAGE)
  }

  return createClient({
    url,
    fetchOptions: () => {
      const sid = sidUtils.getSid()

      return sid
        ? {
            headers: {
              Auth: sid
            }
          }
        : {}
    }
  })
})
