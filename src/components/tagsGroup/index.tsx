import { Badge } from '../../badges'
import React from 'react'

interface TagsGroupsProps {
  tags: string[];
}

export const TagsGroup: React.FC<TagsGroupsProps> = ({ tags = [] }) => {
  return (
    <div className='flex flex-wrap gap-2'>
      {tags.map((tag, index) => (
        <Badge key={index} text={tag} isRemovable={false} />
      ))}
    </div>
  )
}
