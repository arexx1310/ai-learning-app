import React from 'react'

const Spinner = () => {
    return (
        <div className="flex items-center justify-center p-8">
            <div
                className="h-6 w-6 rounded-full border-2 border-[#00d492] border-t-transparent animate-spin"
            />
        </div>
    )
}

export default Spinner;
