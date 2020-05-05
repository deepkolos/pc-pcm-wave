/* eslint-disable no-confusing-arrow */
import style from './style'

function BtnIconLabel({
  icon,
  label,
  disable,
  className,
  onClick,
  onDisableClick,
  Ref,
  iconRef,
}) {
  return (
    <div
      ref={Ref}
      className={`${style.can} ${className}`}
      data-disable={disable}
      onClick={e =>
        disable ? onDisableClick && onDisableClick(e) : onClick && onClick(e)
      }
    >
      <img className={style.icon} src={icon} ref={iconRef} />
      <div className={style.label}>{label}</div>
    </div>
  )
}

export default BtnIconLabel
