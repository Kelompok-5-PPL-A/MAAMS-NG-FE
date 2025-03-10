import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { ValidatorAdminHeader } from '../../components/validatorAdminHeader'
import Mode from '../../constants/mode'

describe('ValidatorAdminHeader component', () => {
  const validatorData = {
    title: 'Sample Title',
    question: 'Sample question',
    mode: Mode.pribadi,
    username: 'JohnDoe',
    created_at: '2022-04-27',
    tags: ['example tag', 'another tag']
  }

  it('renders with correct title, username, tags, and question', () => {
    const { getByText, getByRole } = render(<ValidatorAdminHeader id={'123'} validatorData={validatorData} />)
    const inputElement = getByRole('textbox') as HTMLInputElement

    expect(getByText(validatorData.title)).toBeInTheDocument()
    expect(getByText(`oleh ${validatorData.username}`)).toBeInTheDocument()
    expect(inputElement.value).toBe(validatorData.question)
    validatorData.tags.forEach(tag => {
      expect(getByText(tag)).toBeInTheDocument()
    })
  })

  it('displays disabled input field with correct value', () => {
    const { getByRole } = render(<ValidatorAdminHeader id={'123'} validatorData={validatorData} />)

    const inputElement = getByRole('textbox') as HTMLInputElement
    expect(inputElement.value).toBe(validatorData.question)
    expect(inputElement).toBeDisabled()
  })

  it('question state is disabled to be changed', () => {
    const { getByRole } = render(<ValidatorAdminHeader id={'123'} validatorData={validatorData} />)

    const inputElement = getByRole('textbox') as HTMLInputElement
    fireEvent.change(inputElement, { target: { value: 'New question' } })

    expect(inputElement.value).toBe(validatorData.question)
  })

  it('renders correctly when mode is Mode.pengawasan', () => {
    const { getByText } = render(
      <ValidatorAdminHeader id={'123'} validatorData={{ ...validatorData, mode: Mode.pengawasan }} />
    )

    expect(getByText(validatorData.title)).toBeInTheDocument()
  })

  it('renders correctly when there are multiple tags', () => {
    const { getByText } = render(<ValidatorAdminHeader id={'123'} validatorData={validatorData} />)

    validatorData.tags.forEach(tag => {
      expect(getByText(tag)).toBeInTheDocument()
    })
  })

  it('handles case where tags are empty', () => {
    const { queryByText } = render(
      <ValidatorAdminHeader id={'123'} validatorData={{ ...validatorData, tags: [] }} />
    )

    expect(queryByText('example tag')).not.toBeInTheDocument()
    expect(queryByText('another tag')).not.toBeInTheDocument()
  })

  it('renders question when title is missing', () => {
    const { getByText } = render(
      <ValidatorAdminHeader id={'123'} validatorData={{ ...validatorData, title: '' }} />
    );
  
    expect(getByText(validatorData.question)).toBeInTheDocument();
  });
  

  it('renders default username when username is missing', () => {
    const { getByText } = render(
      <ValidatorAdminHeader id={'123'} validatorData={{ ...validatorData, username: '' }} />
    );
  
    expect(getByText('oleh Username')).toBeInTheDocument();
  });
  

  it('handles case where tags are undefined', () => {
    const { queryByText } = render(
      <ValidatorAdminHeader id={'123'} validatorData={{ ...validatorData, tags: [] }} />
    )

    expect(queryByText('example tag')).not.toBeInTheDocument()
    expect(queryByText('another tag')).not.toBeInTheDocument()
  })

  it('renders question from state when id is undefined', () => {
    const { getByDisplayValue } = render(
      <ValidatorAdminHeader id={undefined} validatorData={validatorData} />
    )

    expect(getByDisplayValue(validatorData.question)).toBeInTheDocument()
  })
})
