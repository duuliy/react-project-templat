import * as React from 'react'
import PropTypes from 'prop-types'

const Footer = ({ name }:{name:string}) => {
  return (
    <div className="footer" style={{ textAlign: 'center', fontSize: '12px', color: 'blcak' }}>
      {name}
    </div>
  )
}

Footer.propTypes = {
  footer: PropTypes.string,
}

export default Footer
