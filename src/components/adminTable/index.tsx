import React from 'react'
import { Item } from '../../components/types/adminTable'
import { useRouter } from 'next/router'

interface Props {
  data: Item[]
}

const AdminTable: React.FC<Props> = ({ data }) => {
  const router = useRouter()

  const handleRowClick = (id: string) => {
    router.push(`/validator/${id}`)
  }

  return (
    <div className='relative overflow-x-auto shadow-md m-12'>
      <table className='w-full text-sm text-left text-black border-collapse'>
        <thead className='text-xs uppercase bg-[#FBC707] text-black'>
          <tr>
            <th scope='col' className='px-6 py-3 w-1/5'>
              Judul
            </th>
            <th scope='col' className='px-6 py-3 w-1/5'>
              Pengguna
            </th>
            <th scope='col' className='px-6 py-3 w-1/5'>
              Topik
            </th>
            <th scope='col' className='px-6 py-3 w-1/5'>
              Waktu
            </th>
            <th scope='col' className='px-6 py-3 w-1/5'>
              <span className='sr-only'>Lihat</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ id, title, displayed_title, user, tags, timestamp }) => (
            <tr
              key={id}
              className='bg-white hover:bg-gray-200 border border-[#FBC707] text-xs h-20 cursor-pointer'
              onClick={() => handleRowClick(id)}
            >
              <td className='px-6 py-4 border-b border-b-[#FBC707] truncate'>
                {(displayed_title || title).length > 60
                  ? `${(displayed_title || title).slice(0, 60)}...`
                  : displayed_title || title}
              </td>
              <td className='px-6 py-4 border-b border-b-[#FBC707] truncate'>
                {user?.length > 10 ? `${user.slice(0, 10)}...` : user}
              </td>
              <td className='px-6 py-4 flex justify-start'>
                {tags.map((tag, tagIndex) => (
                  <button
                    key={tagIndex}
                    className='bg-[#FBC707] text-black px-3 py-3 rounded-3xl text-xs font-bold mr-3'
                  >
                    {tag}
                  </button>
                ))}
              </td>
              <td className='px-6 py-4 border-b border-b-[#FBC707]'>{timestamp}</td>
              <td className='px-6 py-4 text-right border-b border-b-[#FBC707]'>
                <span
                  className='text-blue-600 underline cursor-pointer hover:text-sm'
                  data-testid={`view-button-${id}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRowClick(id)
                  }}
                >
                  Lihat
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminTable
