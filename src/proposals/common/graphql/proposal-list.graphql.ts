import { gql } from '@urql/core'

import { PROPOSAL_FRAGMENT } from './proposal.fragment.graphql'

export const PROPOSAL_LIST = gql`
  query Proposals(
    $filter: ProposalListFilterInputType
    $sort: [ProposalListSortInputType!]
    $pagination: ProposalListPaginationInputType
  ) {
    proposals(filter: $filter, sort: $sort, pagination: $pagination) {
      list {
        ...proposalFragment
      }
    }
  }
  ${PROPOSAL_FRAGMENT}
`
