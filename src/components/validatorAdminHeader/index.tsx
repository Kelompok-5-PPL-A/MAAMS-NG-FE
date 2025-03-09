import { ValidatorQuestionFormProps } from '../types/validatorQuestionFormProps'
import { CustomInput } from '../customInput'
import React, { useState } from 'react'
import { TagsGroup } from '../../components/tagsGroup'

export const ValidatorAdminHeader: React.FC<ValidatorQuestionFormProps> = ({ id, validatorData }) => {
  const [question, setQuestion] = useState<string>(validatorData?.question || '')

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-2xl font-bold text-black'>
        {validatorData?.title ? validatorData?.title : validatorData?.question}
      </h1>
      <p>oleh {validatorData?.username || 'Username'}</p>
      <TagsGroup tags={validatorData?.tags} />
      <div className='w-full'>
        <div className='flex gap-4'>
          <CustomInput
            inputClassName='flex-grow w-full py-7 p-6 bg-white rounded-[10px] shadow border border-zinc-500 justify-start items-center gap-4 inline-flex'
            value={id ? validatorData?.question : question}
            isDisabled={true}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
