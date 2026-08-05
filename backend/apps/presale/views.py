from rest_framework.exceptions import ValidationError
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from . import services
from .models import Contribution, PresaleConfig, Tier
from .serializers import AllocationSerializer, PresaleStatusSerializer

# Base58 addresses are 32-44 chars. Validating length here keeps obviously bad
# input from turning into a full table scan on a wide-open public endpoint.
MIN_ADDRESS_LENGTH = 32
MAX_ADDRESS_LENGTH = 44


class PresaleStatusView(GenericAPIView):
    """Public aggregate view of the raise.

    Deliberately aggregate-only: individual contributor addresses are not
    listed, since publishing the full set of participants would leak the
    contributor list to anyone who hits the API.
    """

    serializer_class = PresaleStatusSerializer

    def get(self, request):
        config = PresaleConfig.load()
        tiers = list(Tier.objects.all())

        payload = {
            'treasury_address': '' if config.is_paused else config.treasury_address,
            'cluster': config.cluster,
            'is_paused': config.is_paused,
            'soft_cap_lamports': str(config.soft_cap_lamports),
            'hard_cap_lamports': str(config.hard_cap_lamports),
            'min_contribution_lamports': str(config.min_contribution_lamports),
            'max_contribution_lamports': str(config.max_contribution_lamports),
            'token_price_lamports': str(config.token_price_lamports),
            'presale_price_usd': config.presale_price_usd,
            'launch_price_usd': config.launch_price_usd,
            'raised_lamports': str(services.total_raised_lamports()),
            'contributor_count': services.contributor_count(),
            'tiers': tiers,
            'last_indexed_at': config.last_indexed_at,
            'sol_usd_price': config.sol_usd_price,
            'sol_usd_updated_at': config.sol_usd_updated_at,
        }
        return Response(self.get_serializer(payload).data)


class AllocationView(GenericAPIView):
    """Allocation lookup for a single address.

    Requires the caller to supply the address, so this returns only what the
    caller already knows rather than enumerating participants.
    """

    serializer_class = AllocationSerializer

    def get(self, request):
        address = request.query_params.get('address', '').strip()
        if not address:
            raise ValidationError({'address': 'This query parameter is required.'})
        if not (MIN_ADDRESS_LENGTH <= len(address) <= MAX_ADDRESS_LENGTH):
            raise ValidationError({'address': 'Not a valid Solana address.'})

        tiers = list(Tier.objects.all())
        allocation = services.allocation_for_address(address, tiers=tiers)

        count = Contribution.objects.filter(
            sender_address=address,
            status=Contribution.Status.CONFIRMED,
        ).count()

        payload = {
            'address': address,
            'contributed_lamports': str(allocation['contributed_lamports']),
            'tier': allocation['tier'],
            'bonus_bps': allocation['bonus_bps'],
            'base_tokens': allocation['base_tokens'],
            'bonus_tokens': allocation['bonus_tokens'],
            'total_tokens': allocation['total_tokens'],
            'contribution_count': count,
        }
        return Response(self.get_serializer(payload).data)
