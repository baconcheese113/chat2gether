import React from 'react'
import styled from 'styled-components'
import { useApolloClient } from '@apollo/client'
import { REPORT_TYPES } from '../helpers/constants'
import { CREATE_REPORT } from '../queries/mutations'
import { Dialog } from './common'
import ChoiceSlider from './ChoiceSlider'

const Subtitle = styled.h3`
  font-size: 16px;
`

export default function ReportUserDialog(props) {
  const { open, onClose, offenderId } = props

  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedTypeIdx, setSelectedTypeIdx] = React.useState(0)

  const client = useApolloClient()

  const handleConfirm = async () => {
    if (selectedTypeIdx === 0) return
    setIsLoading(true)
    const type = REPORT_TYPES[selectedTypeIdx].key
    await client.mutate({ mutation: CREATE_REPORT, variables: { data: { type, offenderId } } })
    setIsLoading(false)
    setSelectedTypeIdx(0)
    onClose(true)
  }

  return (
    <Dialog
      confirmText="Report"
      disabled={selectedTypeIdx === 0}
      isLoading={isLoading}
      open={open}
      title="Report User"
      onCancel={onClose}
      onConfirm={handleConfirm}
    >
      <Subtitle>
        Only report if the misuse falls into one of the following categories. Select whichever best describes it.
      </Subtitle>
      <ChoiceSlider
        vertical
        choices={REPORT_TYPES.map(t => `${t.name} - ${t.desc}`)}
        cur={selectedTypeIdx}
        width="100%"
        onChange={idx => setSelectedTypeIdx(idx)}
      />
    </Dialog>
  )
}
