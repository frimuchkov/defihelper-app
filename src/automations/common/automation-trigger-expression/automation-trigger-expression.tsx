import { MenuItem, TextField } from '@material-ui/core'
import { useState, useEffect } from 'react'

import {
  AutomateActionCreateInputType,
  AutomateActionTypeEnum,
  AutomateActionUpdateInputType,
  AutomateConditionCreateInputType,
  AutomateConditionTypeEnum,
  AutomateConditionUpdateInputType,
} from '~/graphql/_generated-types'
import { AutomationActionEthereumRun } from '../automation-action-ethereum-run'
import { AutomationConditionEthereumBalance } from '../automation-condition-ethereum-balance'
import { Action, Condition } from '../automation.types'
import * as styles from './automation-trigger-expression.css'

export type AutomationTriggerExpressionProps = {
  className?: string
  type: string
  priority: number
  trigger: string
  expression?: Action | Condition
  onSubmitCondition: (
    formValues:
      | AutomateConditionCreateInputType
      | AutomateConditionUpdateInputType
  ) => void
  onSubmitAction: (
    formValues: AutomateActionCreateInputType | AutomateActionUpdateInputType
  ) => void
}

export enum AutomationTriggerExpressions {
  action = 'action',
  condition = 'condition',
}

const getEnum = (type: string) => {
  const currentEnum = {
    [AutomationTriggerExpressions.action]: AutomateActionTypeEnum,
    [AutomationTriggerExpressions.condition]: AutomateConditionTypeEnum,
  }[type]

  if (!currentEnum) throw new Error('error')

  return currentEnum
}

const Forms: Record<
  string,
  {
    component: React.ElementType
    handler: 'onSubmitCondition' | 'onSubmitAction'
  }
> = {
  [AutomateActionTypeEnum.EthereumAutomateRun]: {
    component: AutomationActionEthereumRun,
    handler: 'onSubmitAction',
  },
  [AutomateConditionTypeEnum.EthereumBalance]: {
    component: AutomationConditionEthereumBalance,
    handler: 'onSubmitCondition',
  },
}

export const AutomationTriggerExpression: React.VFC<AutomationTriggerExpressionProps> =
  (props) => {
    const currentEnum = getEnum(props.type)
    const forms = Object.entries<string>(currentEnum)

    const [[, form]] = forms

    const [currentForm, setForm] = useState(form)

    const handleSetForm = (value: string) => () => {
      setForm(value)
    }

    useEffect(() => {
      setForm(form)
    }, [form])

    const { component: Component, handler } = Forms[form]

    const handlers = {
      onSubmitAction: (params: string) => {
        props.onSubmitAction({
          trigger: props.trigger,
          params,
          type: form as AutomateActionTypeEnum,
          priority: props.priority,
        })
      },
      onSubmitCondition: (params: string) => {
        props.onSubmitCondition({
          trigger: props.trigger,
          params,
          type: form as AutomateConditionTypeEnum,
          priority: props.priority,
        })
      },
    }

    const saveParse = (str = '') => {
      try {
        return JSON.parse(str)
      } catch {
        return {}
      }
    }

    return (
      <div className={styles.root}>
        <TextField label="Form" select value={currentForm}>
          {forms.map(([key, value]) => (
            <MenuItem key={key} value={value} onClick={handleSetForm(value)}>
              {value}
            </MenuItem>
          ))}
        </TextField>
        <Component
          onSubmit={handlers[handler]}
          defaultValues={saveParse(props.expression?.params)}
        />
      </div>
    )
  }
