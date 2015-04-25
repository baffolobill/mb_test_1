class ComponentAlreadyInstalled(Exception):
    pass


class ComponentNotInstalled(Exception):
    pass


class ComponentIsBroken(Exception):
    pass


class RackIsFilled(Exception):
    pass


class BasketIsFilled(Exception):
    pass


class BasketSlotIsBusy(Exception):
    pass
